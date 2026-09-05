export interface SearchSection { title: string; text: string }
const stopWords = new Set('a an the to of in on for and or i we it is was with where how my this that'.split(' '));
const forms: Record<string, string> = {
  making: 'make', made: 'make', creating: 'make', created: 'make', create: 'make',
  built: 'make', build: 'make', designing: 'design', designed: 'design',
  mapping: 'map', maps: 'map', levels: 'level', games: 'game',
};
export function searchWords(text: string): string[] {
  return (text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').match(/[a-z0-9]+/g) || [])
    .filter(word => !stopWords.has(word))
    .map(word => forms[word] || forms[Object.keys(forms).find(form => word.length >= 5 && near(word, form)) || ''] || (word.length > 4 && word.endsWith('s') ? word.slice(0, -1) : word));
}
function near(a: string, b: string): boolean {
  if (a.length < 4 || b.length < 4 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length >= b.length) i++;
    if (b.length >= a.length) j++;
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}
export function rankPostSections(sections: SearchSection[], query: string) {
  const terms = [...new Set(searchWords(query))];
  if (!terms.length) return [];
  const indexed = sections.map(section => ({ heading: searchWords(section.title), words: searchWords(section.text) }));
  const weights = terms.map(term => 1 + Math.log(1 + sections.length / (1 + indexed.filter(s => s.words.includes(term) || s.heading.includes(term)).length)));
  return indexed.map((section, index) => {
    let score = 0, matched = 0;
    terms.forEach((term, i) => {
      const heading = section.heading.includes(term);
      const exact = section.words.includes(term);
      const fuzzy = !heading && !exact && [...section.heading, ...section.words].some(word => near(term, word));
      if (heading || exact || fuzzy) {
        matched++;
        score += weights[i] * (heading ? 3 : exact ? 1 : 0.55);
      }
    });
    const coverage = matched / terms.length;
    score *= coverage * coverage;
    if (sections[index].text.toLowerCase().includes(query.trim().toLowerCase())) score += 4;
    return { index, score, matched };
  }).filter(result => result.matched >= Math.min(2, terms.length))
    .sort((a, b) => b.score - a.score || a.index - b.index).slice(0, 6);
}
