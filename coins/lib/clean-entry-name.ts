/**
 * Display formatting for raw card-entry names coming out of Sortly.
 *
 * This is FORMATTING ONLY. cleanEntryName never adds, removes or reorders
 * words — it only changes the casing of tokens and inserts the single space
 * between a grading company and its number ("psa10" -> "PSA 10"). Token count
 * is otherwise preserved exactly.
 *
 * Per-token rules are applied in order, first match wins:
 *   (a) EXACT_CASE dictionary hit
 *   (b) '#'-prefixed card number -> uppercased whole ("#bp17" -> "#BP17")
 *   (c) contains a digit -> left completely alone (serials, years, grades)
 *   (d) already has an internal capital -> left alone (source cased it)
 *   (e) Mc-prefixed surname
 *   (f) hyphen / apostrophe name, capitalized per segment
 *   (g) ordinary word, with small words lowercased when not in first position
 *
 * It therefore CANNOT fix typos. "cheome" stays "Cheome" and a misspelled
 * player name stays misspelled, just re-cased. Those are source-data problems
 * and must be fixed in Sortly, not papered over here — silently "correcting" a
 * name would make the checklist disagree with the inventory record behind it.
 *
 * EXACT_CASE is the extension point. When a new brand, league, abbreviation or
 * internal-caps surname shows up wrong on the site, add the correctly-cased
 * token to that list and it starts winning. It is a list of exact-cased tokens
 * rather than a from -> to map on purpose: an entry can only ever restate its
 * own spelling, so no dictionary edit can smuggle in a word substitution.
 */

/**
 * Tokens whose casing is fixed and cannot be derived by rule.
 *
 * Each entry is the exact casing we want rendered; lookup is case-insensitive
 * on the entry itself. Add new tokens here — order does not matter.
 */
export const EXACT_CASE: readonly string[] = [
  // Brands and sets
  'Topps',
  'Panini',
  'Prizm',
  'Bowman',
  'Donruss',
  'Optic',
  'Mosaic',
  'Select',
  'Chrome',
  'Contenders',
  'Immaculate',
  'Leaf',
  'Upper',
  'Deck',
  'UD',
  'Refractor',
  'Chronicles',
  'Absolute',
  'Obsidian',
  'Spectra',
  'Phoenix',
  'Certified',
  'Elite',
  'Score',
  'Hoops',
  'Illusions',
  'Origins',
  'Revolution',
  'Fleer',
  'Skybox',
  'Merlin',
  'Metal',
  'Limited',
  'Flawless',
  'Prestige',
  'Finest',
  'Pristine',
  'Heritage',
  'Stadium',
  'Club',
  'Allen',
  'Ginter',

  // Grading companies
  'PSA',
  'BGS',
  'SGC',
  'CGC',
  'CSG',
  'HGA',

  // Leagues and governing bodies
  'FIFA',
  'UFC',
  'NBA',
  'NFL',
  'MLB',
  'NHL',
  'MLS',
  'WWE',
  'NASCAR',
  'UEFA',
  'USA',
  'UCL',
  'UCLA',

  // Card jargon
  'RC',
  'SP',
  'SSP',
  'RPA',
  'GU',
  'AU',
  'NM',
  'MT',
  'MVP',
  'HOF',
  'ROY',

  // Name suffixes. Both the bare and the pointed form are listed so that we
  // match whichever one Sortly sent without ever adding or dropping the period.
  'Jr.',
  'Jr',
  'Sr.',
  'Sr',
  'II',
  'III',
  'IV',

  // Surnames and given names with internal capitals that arrive lowercased.
  // Anything Mac-prefixed must live here: unlike "Mc", a blanket Mac rule
  // would wreck ordinary words such as "machine" and "mack".
  'McGwire',
  'McDavid',
  'McCovey',
  'McGriff',
  'McCutchen',
  'McCaffrey',
  'McNabb',
  'McCollum',
  'deGrom',
  'LeBron',
  'DeVonta',
  'JuJu',
  'CeeDee',
  "O'Neal",
  "O'Neill",
];

/** Lowercased token -> exact casing, derived from EXACT_CASE. */
const LOOKUP: ReadonlyMap<string, string> = new Map(
  EXACT_CASE.map((entry) => [entry.toLowerCase(), entry]),
);

/**
 * A grading company jammed against its grade: psa10, BGS9.5, sgc9.
 * Split into two tokens; EXACT_CASE then fixes the company's casing.
 */
const JAMMED_GRADE = /\b(psa|bgs|sgc|cgc|csg|hga)(\d+(?:\.\d+)?)/gi;

/**
 * A card number written with a leading '#': #289, #bp17, #ND-10.
 *
 * Only letters, digits and hyphens after the '#'. Anything else (a serial like
 * "#1/1") falls through to the digit rule and is left alone.
 */
const CARD_NUMBER = /^#[A-Za-z0-9-]+$/;

/**
 * Words that stay lowercase inside a title, but never in first position.
 * Kept small on purpose — these are the ones that actually show up in set and
 * insert names ("dead of night", "man of the year").
 */
const SMALL_WORDS: ReadonlySet<string> = new Set([
  'of',
  'the',
  'and',
  'a',
  'an',
  'in',
  'on',
  'at',
  'to',
  'for',
  'by',
  'from',
  'with',
]);

/** Capitalize one word: first letter up, remainder down. */
function capitalize(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Format a single whitespace-delimited token. First matching rule wins.
 *
 * @param token The raw token.
 * @param index Its 0-based position in the entry. Only rule (g) uses it: a
 *   small word is lowercased mid-title but never in first position.
 */
function formatToken(token: string, index: number): string {
  if (!token) return token;

  // (a) Dictionary hit on the whole token, checked before punctuation is
  // stripped so that entries carrying their own punctuation ("Jr.") match.
  const wholeHit = LOOKUP.get(token.toLowerCase());
  if (wholeHit !== undefined) return wholeHit;

  // (b) '#'-prefixed card numbers are uppercased whole: "#bp17" -> "#BP17",
  // "#289" -> "#289" (no letters, so unchanged). This runs BEFORE the digit
  // rule below, which would otherwise leave "#bp17" lowercase next to a
  // correctly-cased "#289". The leading '#' is what makes this safe to
  // uppercase — it marks the token as a card number rather than a serial, so
  // "1/1", "/99", "9.5", "2023-24" and bare years never reach here.
  if (CARD_NUMBER.test(token)) {
    return '#' + token.slice(1).toUpperCase();
  }

  // Peel leading/trailing punctuation for lookup, but keep it for output.
  const lead = token.match(/^[^A-Za-z0-9]+/)?.[0] ?? '';
  const trail = token.slice(lead.length).match(/[^A-Za-z0-9]+$/)?.[0] ?? '';
  const core = token.slice(lead.length, token.length - trail.length);

  // Nothing alphanumeric to work with (a bare "-", "/", ...). Leave it.
  if (!core) return token;

  // (a) Dictionary hit on the bare core, e.g. "topps," -> "Topps,".
  const coreHit = LOOKUP.get(core.toLowerCase());
  if (coreHit !== undefined) return lead + coreHit + trail;

  // (c) Anything with a digit is left completely alone. This is what protects
  // serials and print runs (1/1, /99), years (1983), seasons (2023-24) and
  // grades (9.5). Card numbers already returned at (b).
  if (/[0-9]/.test(core)) return token;

  // (d) The source already capitalized something past the first character, so
  // it was cased deliberately ("deGrom", "McGwire"). Do not second-guess it.
  // This is what makes rules (e), (f) and (g) idempotent — and it deliberately
  // wins over the small-word rule, so an already-correct string is stable.
  if (/[A-Z]/.test(core.slice(1))) return token;

  // (e) Mc-prefixed surnames. Safe as a blanket rule because English has no
  // common lowercase "mc..." word. Mac- names are dictionary-only, see above.
  if (/^mc[a-z]{2,}$/i.test(core)) {
    return lead + 'Mc' + capitalize(core.slice(2)) + trail;
  }

  // (f) Hyphenated and apostrophized names: capitalize each segment. A
  // trailing one-character segment is left alone so possessives stay
  // possessive ("shaq's" -> "Shaq's", never "Shaq'S") while real names still
  // work ("o'neill" -> "O'Neill", "smith-schuster" -> "Smith-Schuster").
  if (core.includes('-') || core.includes("'")) {
    const parts = core.split(/([-'])/);
    const lastIndex = parts.length - 1;
    const cased = parts.map((part, partIndex) => {
      if (partIndex % 2 === 1) return part; // the captured separator
      if (partIndex === lastIndex && part.length === 1) return part;
      return capitalize(part);
    });
    return lead + cased.join('') + trail;
  }

  // (g) Ordinary word. Small words stay lowercase mid-title ("dead of night"
  // -> "Dead of Night") but are capitalized in first position, where they open
  // the name ("the ultimate rookie card" -> "The Ultimate Rookie Card").
  if (index > 0 && SMALL_WORDS.has(core.toLowerCase())) {
    return lead + core.toLowerCase() + trail;
  }

  return lead + capitalize(core) + trail;
}

/**
 * Normalize the casing and spacing of a raw Sortly entry name.
 *
 * Formatting only — see the file header. The function is idempotent:
 * cleanEntryName(cleanEntryName(s)) === cleanEntryName(s).
 *
 * @param raw Free-text entry name, e.g. "1983 topps carl yastrzemski psa 10".
 * @returns The same words, display-cased: "1983 Topps Carl Yastrzemski PSA 10".
 */
export function cleanEntryName(raw: string): string {
  if (!raw) return '';

  // 1. Trim and collapse whitespace runs.
  const collapsed = raw.trim().replace(/\s+/g, ' ');
  if (!collapsed) return '';

  // 2. Unjam grading company from grade.
  const spaced = collapsed.replace(JAMMED_GRADE, (_match, company, grade) => `${company} ${grade}`);

  // 3-4. Format each token. Position matters only for the small-word rule.
  return spaced
    .split(' ')
    .map((token, index) => formatToken(token, index))
    .join(' ');
}
