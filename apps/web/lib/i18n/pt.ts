import type { Dict } from "./en";

// Brazilian Portuguese UI strings. Must cover every key in `en`.
export const pt: Dict = {
  // Nav
  "nav.myBar": "Meu Bar",
  "nav.whatCanIMake": "O Que Posso Fazer",
  "nav.recommended": "Recomendados",
  "nav.settings": "Configurações",

  // Landing
  "landing.est": "Est. 2026  ·  A Private Bar",
  "landing.tagline": "O que você pode fazer hoje?",
  "landing.blurb":
    "Conte o que tem na sua prateleira. Mostramos todo coquetel que dá pra preparar agora — e aprendemos seu paladar a cada drink que você avalia.",
  "landing.stepInside": "Entrar",
  "landing.step1": "Monte seu bar em segundos",
  "landing.step2": "Veja o que dá pra servir hoje",
  "landing.step3": "Avalie, e aprendemos seu gosto",

  // My Bar
  "bar.eyebrow": "Sua Coleção",
  "bar.title": "Meu Bar",
  "bar.loading": "Carregando seu bar…",
  "bar.stat": "{n} ingredientes à mão",
  "bar.statReady": "{n} ingredientes à mão · {r} drinks prontos",
  "bar.addIngredient": "Adicionar ingrediente",
  "bar.searchPlaceholder": "Busque destilados, mixers, cítricos…",
  "bar.exploreOptions": "Explorar opções",
  "bar.hideOptions": "Ocultar opções",
  "bar.allIngredients": "Todos os ingredientes",
  "bar.inYourBar": "No seu bar",
  "bar.noMatch": "Nada corresponde a “{q}” no catálogo.",
  "bar.empty":
    "Seu bar está vazio — busque acima pra adicionar sua primeira garrafa.",
  "bar.seeWhatICanMake": "Ver o que posso fazer",
  "bar.errAdd": "Não foi possível adicionar o ingrediente",
  "bar.errRemove": "Não foi possível remover o ingrediente",

  // Ingredient categories
  "cat.SPIRIT": "Destilados",
  "cat.LIQUEUR": "Licores",
  "cat.MIXER": "Mixers",
  "cat.SYRUP": "Xaropes",
  "cat.BITTER": "Bitters",
  "cat.GARNISH": "Guarnições",
  "cat.OTHER": "Outros",

  // What Can I Make
  "make.eyebrow": "O Cardápio de Hoje",
  "make.title": "O Que Posso Fazer",
  "make.filterAll": "Todos",
  "make.filterReady": "Prontos",
  "make.filterAlmost": "Quase",
  "make.loading": "Preparando seu cardápio…",
  "make.error": "Não foi possível carregar o cardápio: {e}",
  "make.emptyPre": "Nada pra servir ainda — adicione algumas garrafas em",
  "make.emptyLink": "Meu Bar",
  "make.readyToMake": "Prontos pra Fazer",
  "make.almostThere": "Quase Lá",
  "make.readyToPour": "Pronto pra servir",
  "make.recipe": "Receita",
  "make.missing_one": "Falta um",
  "make.missing_other": "Faltam dois",
  "make.prev": "Anterior",
  "make.next": "Próximo",
  "make.pageOf": "Página {p} de {t}",

  // Recipe Detail
  "detail.back": "Voltar ao cardápio",
  "detail.photo": "foto do drink",
  "detail.rate": "Avalie este drink",
  "detail.rated": "Você deu {x} / {y} — seu paladar ficou mais afiado.",
  "detail.rateHint": "Toque pra avaliar e ensinar seu gosto ao Mxologist.",
  "detail.updatedPicks": "Ver sugestões atualizadas",
  "detail.favorite": "Adicionar aos favoritos",
  "detail.favorited": "Favoritado",
  "detail.ingredients": "Ingredientes",
  "detail.method": "Modo de Preparo",
  "detail.add": "Adicionar",
  "detail.glass": "{glass}",
  "detail.loading": "Servindo os detalhes…",
  "detail.error": "Não foi possível carregar esta receita: {e}",

  // Recommended
  "rec.eyebrow": "Afinado ao seu paladar",
  "rec.title": "Recomendados pra Você",
  "rec.intro_one":
    "Com base no {n} drink que você avaliou, aqui está o que achamos que você vai querer servir.",
  "rec.intro_other":
    "Com base nos {n} drinks que você avaliou, aqui está o que achamos que você vai querer servir.",
  "rec.introCold":
    "Avalie alguns drinks e começamos a sugerir o que achamos que você vai amar. Por enquanto, alguns favoritos.",
  "rec.error": "Não foi possível carregar as recomendações: {e}",
  "rec.loading": "Lendo seu paladar…",
  "rec.tasteProfile": "Seu perfil de sabor",
  "rec.tasteEmpty":
    "Avalie alguns drinks e seu paladar vai tomar forma aqui.",
  "rec.picked": "Escolhidos pra sua prateleira",
  "rec.noPicks": "Nenhuma sugestão ainda.",
  "rec.favorites": "Seus favoritos",
  "rec.noFavorites": "Nenhum favorito ainda. Toque na estrela de um drink pra guardá-lo aqui.",
  "rec.match": "afinidade",
  "rec.pourTonight": "Sirva hoje",
  "rec.away_one": "falta {n} ingrediente",
  "rec.away_other": "faltam {n} ingredientes",
  "rec.stretch": "Uma aposta ousada",

  // Flavor tags
  "flavor.SOUR": "Azedo",
  "flavor.SWEET": "Doce",
  "flavor.BITTER": "Amargo",
  "flavor.BOOZY": "Alcoólico",
  "flavor.REFRESHING": "Refrescante",
  "flavor.CREAMY": "Cremoso",
  "flavor.SPICY": "Picante",
  "flavor.FRUITY": "Frutado",
  "flavor.HERBAL": "Herbal",

  // Settings
  "settings.eyebrow": "Suas Preferências",
  "settings.title": "Configurações",
  "settings.subtitle":
    "Ajuste o Mxologist ao seu jeito de servir, medir e avaliar. As mudanças valem na hora.",
  "settings.saving": "Salvando…",
  "settings.saved": "Salvo ✓",
  "settings.errSave": "Não foi possível salvar",
  "settings.loading": "Carregando configurações…",
  "settings.errLoad": "Não foi possível carregar as configurações.",
  "settings.age.label": "Idade",
  "settings.age.desc": "Usado apenas para treinar o modelo",
  "settings.age.suffix": "anos",
  "settings.unit.label": "Unidade de Medida",
  "settings.unit.desc": "Como as medidas dos ingredientes aparecem nas receitas.",
  "settings.sex.label": "Sexo",
  "settings.sex.desc": "Ajuda a estimar como um drink pode te afetar.",
  "settings.sex.female": "Feminino",
  "settings.sex.male": "Masculino",
  "settings.sex.other": "Outro",
  "settings.score.label": "Tipo de Nota",
  "settings.score.desc": "Como você avalia cada drink que faz.",
  "settings.score.fiveStars": "5 Estrelas",
  "settings.score.oneToTen": "1–10",
  "settings.score.previewStars": "Prévia: ★ ★ ★ ★ ☆",
  "settings.score.previewNumeric": "Prévia: 8 / 10",
  "settings.lang.label": "Idioma",
  "settings.lang.desc": "O idioma em que o Mxologist fala com você.",
  "settings.color.label": "Cor do Site",
  "settings.color.desc":
    "Defina o fundo do bar. Escolha uma base — só prévia por enquanto.",
  "settings.color.active": "◆ Ativo",
};
