import nextVitals from "eslint-config-next/core-web-vitals";
import { fixupConfigRules } from "@eslint/compat";
import tseslint from "typescript-eslint";

const eslintConfig = [
  // Preserve the Next/React/accessibility rules while their plugins migrate
  // from the context methods removed in ESLint 10.
  ...fixupConfigRules(nextVitals),
  { ignores: ['.claude/worktrees/**'] },
  // Next's bundled Babel parser still has the pre-ESLint-10 scope API.
  // The supported TypeScript parser also handles our JavaScript and JSX.
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  // These components synchronize browser storage, route transitions, or measured DOM state after hydration.
  // Keep the rule enabled for all other files; replacing these requires an external-store/animation refactor.
  { files: [
    'app/blog/BlogSearchWrapper.tsx', 'app/blog/PostSearchBar.tsx', 'app/blog/useReadingPreferences.ts',
    'app/components/CornerSmoothingManager.tsx', 'app/components/LightboxClient.tsx',
    'app/components/NavigationClient.tsx', 'app/components/ThemeProvider.tsx', 'app/components/TopAppBar.tsx',
    'app/components/SearchShortcutChip.tsx', 'app/settings/page.tsx', 'app/settings/feature-flags/page.tsx',
  ], rules: { 'react-hooks/set-state-in-effect': 'off' } },
  // Existing pointer-animation machinery reads mutable geometry between renders.
  { files: ['app/components/NavigationClient.tsx', 'app/components/Switch.tsx'], rules: { 'react-hooks/refs': 'off' } },
  {
    rules: {



      "react/no-unescaped-entities": "off",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default eslintConfig;
