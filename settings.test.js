const fs = require('fs');

describe('settings.js theme toggling', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input type="radio" name="theme" value="light">
      <input type="radio" name="theme" value="dark">
      <input type="radio" name="theme" value="auto">
    `;
    document.documentElement.dataset.theme = '';
    localStorage.clear();
    jest.resetModules();
  });

  test('loads initial theme from localStorage', () => {
    localStorage.setItem('theme', 'light');
    require('./settings.js');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  test('updates theme and localStorage on change', () => {
    require('./settings.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    const darkInput = document.querySelector('input[value="dark"]');
    darkInput.checked = true;
    darkInput.dispatchEvent(new Event('change', { bubbles: true }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
