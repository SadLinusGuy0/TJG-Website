import { rankPostSections } from '../lib/postSearch';
const sections = [
  { title: 'Game overview', text: 'This game is about escaping the city.' },
  { title: 'Creating the map', text: 'I made the layout in Blender. The roads connect the bank to the escape route.' },
  { title: 'Audio', text: 'I recorded music and engine sounds.' },
];
test('finds a section without an exact phrase', () => {
  expect(rankPostSections(sections, 'making game map')[0]?.index).toBe(1);
});
test('matches minor typos and reversed word order', () => {
  expect(rankPostSections(sections, 'map creatng')[0]?.index).toBe(1);
  expect(rankPostSections(sections, 'map creating')[0]?.index).toBe(1);
});
test('does not return unrelated sections', () => {
  expect(rankPostSections(sections, 'cooking pasta')).toEqual([]);
  expect(rankPostSections(sections, 'the and')).toEqual([]);
});
