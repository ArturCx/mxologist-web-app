// Two-tower neural recommender on TensorFlow.js.
//
//   user features ─ dense(32) ─ dense(16) ─┐
//                                          dot ─ dense(1) ─ predicted score
//   item features ─ dense(32) ─ dense(16) ─┘
//
// Pure-JS CPU backend on purpose: tfjs-node ships a native binary that blows
// the Vercel Function size limit, and at this scale (hundreds of recipes, a
// few thousand ratings) the JS backend trains in seconds.
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';
import * as tfl from '@tensorflow/tfjs-layers';
import {
  createEncoder,
  denormalizeScore,
  encodeUser,
  itemDim,
  normalizeScore,
  userDim,
  type Demographics,
  type HistoryEntry,
  type RecipeSource,
  type Vocab,
} from './features';

export type RatingRow = { userId: string; recipeId: string; score: number };

export type TrainOptions = {
  // Upper bound — with a validation split, training stops early once the
  // held-out error stops improving (the net overfits quickly at this scale).
  epochs?: number;
  patience?: number;
  // Wall-clock budget, so a cron-triggered run stays inside the Vercel
  // Function duration limit however large the ratings table gets.
  maxDurationMs?: number;
  batchSize?: number;
  learningRate?: number;
  valFraction?: number;
  seed?: number;
};

export type TrainMetrics = {
  epochs: number;
  trainExamples: number;
  valExamples: number;
  trainLoss: number;
  // Mean absolute error on held-out ratings, in rating points (1–10 scale).
  valMae: number | null;
  // Same split, always predicting the training mean — the bar to clear.
  meanBaselineMae: number | null;
  durationMs: number;
};

export type SerializedModel = {
  topology: unknown;
  weightSpecs: unknown;
  weights: Uint8Array<ArrayBuffer>;
};

const EMBEDDING = 16;
const HIDDEN = 32;

// Small deterministic PRNG so splits (and synthetic data) are reproducible.
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildModel(vocab: Vocab, seed: number): tfl.LayersModel {
  const tower = (input: tfl.SymbolicTensor, name: string, s: number) => {
    const hidden = tfl.layers
      .dense({
        units: HIDDEN,
        activation: 'relu',
        kernelInitializer: tfl.initializers.glorotUniform({ seed: s }),
        kernelRegularizer: tfl.regularizers.l2({ l2: 1e-4 }),
        name: `${name}_hidden`,
      })
      .apply(input) as tfl.SymbolicTensor;
    return tfl.layers
      .dense({
        units: EMBEDDING,
        kernelInitializer: tfl.initializers.glorotUniform({ seed: s + 1 }),
        name: `${name}_embedding`,
      })
      .apply(hidden) as tfl.SymbolicTensor;
  };

  const user = tfl.input({ shape: [userDim(vocab)], name: 'user' });
  const item = tfl.input({ shape: [itemDim(vocab)], name: 'item' });
  const dot = tfl.layers
    .dot({ axes: -1, name: 'affinity' })
    .apply([tower(user, 'user', seed), tower(item, 'item', seed + 10)]);
  // Learns the scale + bias that map raw affinity onto the score range.
  const output = tfl.layers
    .dense({ units: 1, name: 'score' })
    .apply(dot) as tfl.SymbolicTensor;

  return tfl.model({ inputs: [user, item], outputs: output });
}

function stack(rows: Float32Array[], dim: number): tf.Tensor2D {
  const flat = new Float32Array(rows.length * dim);
  rows.forEach((r, i) => flat.set(r, i * dim));
  return tf.tensor2d(flat, [rows.length, dim]);
}

const mae = (pred: number[], truth: number[]) =>
  pred.reduce((s, p, i) => s + Math.abs(p - truth[i]), 0) / (pred.length || 1);

export async function trainModel(
  recipes: RecipeSource[],
  ratings: RatingRow[],
  demographics: Map<string, Demographics>,
  vocab: Vocab,
  opts: TrainOptions = {},
): Promise<{ model: tfl.LayersModel; metrics: TrainMetrics }> {
  const {
    epochs = 30,
    patience = 3,
    maxDurationMs = 40_000,
    batchSize = 256,
    learningRate = 0.01,
    valFraction = 0.2,
    seed = 42,
  } = opts;
  const started = Date.now();
  const rand = mulberry32(seed);

  const encoder = createEncoder(vocab);
  const vectors = new Map(recipes.map((r) => [r.id, encoder.encodeRecipe(r)]));
  const usable = ratings.filter((r) => vectors.has(r.recipeId));

  // Hold out a random slice of ratings, but only once there's enough data for
  // the number to mean anything.
  const isVal = usable.map(() => usable.length >= 25 && rand() < valFraction);
  const trainByUser = new Map<string, HistoryEntry[]>();
  usable.forEach((r, i) => {
    if (isVal[i]) return;
    const list = trainByUser.get(r.userId) ?? [];
    list.push({ recipeId: r.recipeId, score: r.score });
    trainByUser.set(r.userId, list);
  });

  // Leave-one-out: the user profile for an example never contains the rating
  // being predicted (nor any held-out rating), otherwise the net just learns
  // to read the answer back out of its own input.
  const example = (r: RatingRow) => {
    const history = (trainByUser.get(r.userId) ?? []).filter(
      (h) => h.recipeId !== r.recipeId,
    );
    const demo = demographics.get(r.userId) ?? { age: null, sex: null };
    return {
      user: encodeUser(history, vectors, demo, vocab),
      item: vectors.get(r.recipeId)!,
      y: normalizeScore(r.score),
    };
  };
  const train = usable.filter((_, i) => !isVal[i]).map(example);
  const val = usable.filter((_, i) => isVal[i]).map(example);

  const model = buildModel(vocab, seed);
  model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: 'meanSquaredError',
  });

  const uDim = userDim(vocab);
  const iDim = itemDim(vocab);
  const xUser = stack(
    train.map((e) => e.user),
    uDim,
  );
  const xItem = stack(
    train.map((e) => e.item),
    iDim,
  );
  const y = tf.tensor2d(
    train.map((e) => e.y),
    [train.length, 1],
  );

  const truth = val.map((e) => denormalizeScore(e.y));
  const valUsers = val.map((e) => e.user);
  const valItems = val.map((e) => e.item);

  let trainLoss = NaN;
  let epochsRun = 0;
  let valMae: number | null = null;
  let best: tf.Tensor[] | null = null;
  let sinceBest = 0;
  while (epochsRun < epochs && Date.now() - started < maxDurationMs) {
    const h = await model.fit([xUser, xItem], y, {
      epochs: 1,
      batchSize,
      shuffle: true,
      verbose: 0,
    });
    trainLoss = (h.history.loss as number[])[0];
    epochsRun++;
    if (val.length === 0) continue;

    const epochMae = mae(predictRaw(model, valUsers, valItems, vocab), truth);
    if (valMae === null || epochMae < valMae) {
      valMae = epochMae;
      tf.dispose(best ?? []);
      best = model.getWeights().map((w) => w.clone());
      sinceBest = 0;
    } else if (++sinceBest >= patience) {
      break;
    }
  }
  tf.dispose([xUser, xItem, y]);
  if (best) {
    model.setWeights(best);
    tf.dispose(best);
  }

  let meanBaselineMae: number | null = null;
  if (val.length > 0) {
    const mean =
      train.reduce((s, e) => s + denormalizeScore(e.y), 0) / train.length;
    meanBaselineMae = mae(
      truth.map(() => mean),
      truth,
    );
  }

  return {
    model,
    metrics: {
      epochs: epochsRun,
      trainExamples: train.length,
      valExamples: val.length,
      trainLoss,
      valMae,
      meanBaselineMae,
      durationMs: Date.now() - started,
    },
  };
}

function predictRaw(
  model: tfl.LayersModel,
  users: Float32Array[],
  items: Float32Array[],
  vocab: Vocab,
): number[] {
  if (items.length === 0) return [];
  return tf.tidy(() => {
    const out = model.predict([
      stack(users, userDim(vocab)),
      stack(items, itemDim(vocab)),
    ]) as tf.Tensor;
    return Array.from(out.dataSync()).map(denormalizeScore);
  });
}

// Predicted 1–10 score for every candidate recipe, for one user.
export function scoreRecipes(
  model: tfl.LayersModel,
  vocab: Vocab,
  history: HistoryEntry[],
  historyRecipes: RecipeSource[],
  demo: Demographics,
  candidates: RecipeSource[],
): number[] {
  const encoder = createEncoder(vocab);
  const vectors = new Map(
    historyRecipes.map((r) => [r.id, encoder.encodeRecipe(r)]),
  );
  const user = encodeUser(history, vectors, demo, vocab);
  return predictRaw(
    model,
    candidates.map(() => user),
    candidates.map((c) => encoder.encodeRecipe(c)),
    vocab,
  );
}

export async function serializeModel(
  model: tfl.LayersModel,
): Promise<SerializedModel> {
  let out: SerializedModel | undefined;
  await model.save(
    tf.io.withSaveHandler((artifacts) => {
      const data = artifacts.weightData
        ? tf.io.CompositeArrayBuffer.join(artifacts.weightData)
        : new ArrayBuffer(0);
      out = {
        topology: artifacts.modelTopology,
        weightSpecs: artifacts.weightSpecs,
        weights: new Uint8Array(data),
      };
      return Promise.resolve({
        modelArtifactsInfo: {
          dateSaved: new Date(),
          modelTopologyType: 'JSON',
        },
      });
    }),
  );
  if (!out) throw new Error('Model serialization produced no artifacts');
  return out;
}

export function deserializeModel(s: SerializedModel): Promise<tfl.LayersModel> {
  // Copy into a standalone ArrayBuffer — a Node Buffer from Prisma may be a
  // view into a larger shared pool.
  const weightData = new Uint8Array(s.weights).buffer;
  return tfl.loadLayersModel(
    tf.io.fromMemory({
      modelTopology: s.topology as object,
      weightSpecs: s.weightSpecs as tf.io.WeightsManifestEntry[],
      weightData,
    }),
  );
}
