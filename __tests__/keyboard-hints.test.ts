import { suggestsHardwareKeyboard } from '../app/components/useKeyboardHints';

jest.mock('../lib/keyboard', () => ({ isKeyboardInput: (target: unknown) => target !== null }));

function key(overrides: Partial<KeyboardEvent> = {}) {
  return { isTrusted: true, isComposing: false, key: 'a', code: 'KeyA', target: {} as EventTarget, ...overrides } as KeyboardEvent;
}

test('typing with a software keyboard does not enable hints', () => {
  for (const value of ['a', 'Enter', 'Backspace', 'Unidentified', 'Process']) {
    expect(suggestsHardwareKeyboard(key({ key: value }))).toBe(false);
  }
});

test('keyboard navigation and modifier shortcuts enable hints', () => {
  expect(suggestsHardwareKeyboard(key({ key: 'Tab' }))).toBe(true);
  expect(suggestsHardwareKeyboard(key({ key: 'k', metaKey: true }))).toBe(true);
  expect(suggestsHardwareKeyboard(key({ key: 'k', ctrlKey: true }))).toBe(true);
  expect(suggestsHardwareKeyboard(key({ key: '[', code: 'BracketLeft', target: null }))).toBe(true);
});

test('ignore composition and scripted events', () => {
  expect(suggestsHardwareKeyboard(key({ key: 'Tab', isTrusted: false }))).toBe(false);
  expect(suggestsHardwareKeyboard(key({ key: 'Tab', isComposing: true }))).toBe(false);
});
