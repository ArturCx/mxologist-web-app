// English UI strings. Keys are flat & dotted by area. `{var}` placeholders are
// filled by t(key, params). Plural variants use _one / _other suffixes.
// DB content (recipe names, instructions, ingredient names) is translated
// separately, not here.
export const en = {
  // Nav
  "nav.myBar": "My Bar",
  "nav.whatCanIMake": "What Can I Make",
  "nav.recommended": "Recommended",
  "nav.settings": "Settings",

  // Landing
  "landing.est": "Est. 2026  ·  A Private Bar",
  "landing.tagline": "What can you make tonight?",
  "landing.blurb":
    "Tell us what's on your shelf. We'll show you every cocktail you can pour right now — and learn your palate with every glass you rate.",
  "landing.stepInside": "Step Inside",
  "landing.step1": "Stock your bar in seconds",
  "landing.step2": "See what's pourable tonight",
  "landing.step3": "Rate, and we learn your taste",

  // My Bar
  "bar.eyebrow": "Your Collection",
  "bar.title": "My Bar",
  "bar.loading": "Loading your bar…",
  "bar.stat": "{n} ingredients on hand",
  "bar.statReady": "{n} ingredients on hand · {r} drinks ready",
  "bar.addIngredient": "Add an ingredient",
  "bar.searchPlaceholder": "Search spirits, mixers, citrus…",
  "bar.noMatch": "Nothing matches “{q}” in the catalog.",
  "bar.empty": "Your bar is empty — search above to add your first bottle.",
  "bar.seeWhatICanMake": "See what I can make",
  "bar.errAdd": "Couldn't add ingredient",
  "bar.errRemove": "Couldn't remove ingredient",

  // Ingredient categories
  "cat.SPIRIT": "Spirits",
  "cat.LIQUEUR": "Liqueurs",
  "cat.MIXER": "Mixers",
  "cat.SYRUP": "Syrups",
  "cat.BITTER": "Bitters",
  "cat.GARNISH": "Garnishes",
  "cat.OTHER": "Other",

  // What Can I Make
  "make.eyebrow": "Tonight's Menu",
  "make.title": "What Can I Make",
  "make.filterAll": "All",
  "make.filterReady": "Ready",
  "make.filterAlmost": "Almost",
  "make.loading": "Mixing your menu…",
  "make.error": "Couldn't load your menu: {e}",
  "make.emptyPre": "Nothing pourable yet — add a few bottles in",
  "make.emptyLink": "My Bar",
  "make.readyToMake": "Ready to Make",
  "make.almostThere": "Almost There",
  "make.readyToPour": "Ready to pour",
  "make.recipe": "Recipe",
  "make.missing_one": "Missing one",
  "make.missing_other": "Missing two",
  "make.prev": "Prev",
  "make.next": "Next",
  "make.pageOf": "Page {p} of {t}",

  // Recipe Detail
  "detail.back": "Back to the menu",
  "detail.photo": "drink photo",
  "detail.rate": "Rate this pour",
  "detail.rated": "You rated this {x} / {y} — your palate just got sharper.",
  "detail.rateHint": "Tap to rate and teach Mxologist your taste.",
  "detail.updatedPicks": "See updated picks",
  "detail.favorite": "Add to favorites",
  "detail.favorited": "Favorited",
  "detail.ingredients": "Ingredients",
  "detail.method": "Method",
  "detail.add": "Add",
  "detail.glass": "{glass} glass",
  "detail.loading": "Pouring the details…",
  "detail.error": "Couldn't load this recipe: {e}",

  // Recommended
  "rec.eyebrow": "Tuned to your palate",
  "rec.title": "Recommended for You",
  "rec.intro_one":
    "Based on the {n} drink you've rated, here's what we think you'll want to pour next.",
  "rec.intro_other":
    "Based on the {n} drinks you've rated, here's what we think you'll want to pour next.",
  "rec.introCold":
    "Rate a few drinks and we'll start surfacing pours we think you'll love. For now, here are some crowd favourites.",
  "rec.error": "Couldn't load recommendations: {e}",
  "rec.loading": "Reading your palate…",
  "rec.tasteProfile": "Your taste profile",
  "rec.tasteEmpty": "Rate a few drinks and your palate will take shape here.",
  "rec.picked": "Picked for your shelf",
  "rec.noPicks": "No picks yet.",
  "rec.favorites": "Your favorites",
  "rec.noFavorites": "No favorites yet. Tap the star on any drink to keep it here.",
  "rec.match": "match",
  "rec.pourTonight": "Pour it tonight",
  "rec.away_one": "{n} ingredient away",
  "rec.away_other": "{n} ingredients away",
  "rec.stretch": "A stretch pick",

  // Flavor tags
  "flavor.SOUR": "Sour",
  "flavor.SWEET": "Sweet",
  "flavor.BITTER": "Bitter",
  "flavor.BOOZY": "Boozy",
  "flavor.REFRESHING": "Refreshing",
  "flavor.CREAMY": "Creamy",
  "flavor.SPICY": "Spicy",
  "flavor.FRUITY": "Fruity",
  "flavor.HERBAL": "Herbal",

  // Settings
  "settings.eyebrow": "Your Preferences",
  "settings.title": "Settings",
  "settings.subtitle":
    "Tune Mxologist to how you pour, measure and rate. Changes apply across the bar instantly.",
  "settings.saving": "Saving…",
  "settings.saved": "Saved ✓",
  "settings.errSave": "Couldn't save",
  "settings.loading": "Loading settings…",
  "settings.errLoad": "Couldn't load settings.",
  "settings.age.label": "Age",
  "settings.age.desc": "Used only to train the model",
  "settings.age.suffix": "yrs",
  "settings.unit.label": "Measurement Unit",
  "settings.unit.desc": "How ingredient measures are shown in recipes.",
  "settings.sex.label": "Sex",
  "settings.sex.desc": "Helps estimate how a pour may affect you.",
  "settings.sex.female": "Female",
  "settings.sex.male": "Male",
  "settings.sex.other": "Other",
  "settings.score.label": "Score Type",
  "settings.score.desc": "How you rate each pour you make.",
  "settings.score.fiveStars": "5 Stars",
  "settings.score.oneToTen": "1–10",
  "settings.score.previewStars": "Preview: ★ ★ ★ ★ ☆",
  "settings.score.previewNumeric": "Preview: 8 / 10",
  "settings.lang.label": "Language",
  "settings.lang.desc": "The language Mxologist speaks to you in.",
  "settings.color.label": "Website Color",
  "settings.color.desc":
    "Set the bar's backdrop. Pick a base — preview only for now.",
  "settings.color.active": "◆ Active",
} as const;

export type I18nKey = keyof typeof en;
export type Dict = Record<I18nKey, string>;
