import React from 'react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <label>
        <input
          type="radio"
          name="theme"
          value="light"
          checked={theme === 'light'}
          onChange={() => setTheme('light')}
        />
        Light
      </label>
      <label>
        <input
          type="radio"
          name="theme"
          value="dark"
          checked={theme === 'dark'}
          onChange={() => setTheme('dark')}
        />
        Dark
      </label>
      <label>
        <input
          type="radio"
          name="theme"
          value="auto"
          checked={theme === 'auto'}
          onChange={() => setTheme('auto')}
        />
        Auto
      </label>
    </div>
  );
}
