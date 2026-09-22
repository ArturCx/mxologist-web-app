// Manual training run, same code path as the cron endpoint:
//   npm run ml:train                         real ratings
//   npm run ml:train -- --synthetic          generated users (saved inactive)
//   npm run ml:train -- --synthetic --activate
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MlService } from './ml.service';

async function main() {
  const args = new Set(process.argv.slice(2));
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  const result = await app.get(MlService).train({
    synthetic: args.has('--synthetic'),
    activate: args.has('--activate')
      ? true
      : args.has('--no-activate')
        ? false
        : undefined,
  });
  console.log(JSON.stringify(result, null, 2));
  await app.close();
}

void main();
