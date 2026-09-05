import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ESLint } from 'eslint';

const eslint = new ESLint();

for (const extension of ['jsx', 'tsx']) {
  test(`React and accessibility mistakes are reported in ${extension}`, async () => {
    const [result] = await eslint.lintText(`
      import { useEffect } from 'react';
      export default function Example({ enabled }) {
        if (enabled) useEffect(() => {}, []);
        return <div>
          <img src="/example.png" aria-hidden="invalid" />
          {[1, 2].map(value => <span>{value}</span>)}
        </div>;
      }
    `, { filePath: `app/components/LintProbe.${extension}` });
    assert.equal(result.fatalErrorCount, 0, JSON.stringify(result.messages));
    const rules = new Set(result.messages.map(message => message.ruleId));
    for (const rule of ['react-hooks/rules-of-hooks', 'jsx-a11y/alt-text', 'jsx-a11y/aria-proptypes', 'react/jsx-key']) {
      assert.ok(rules.has(rule), `Expected ${rule}: ${JSON.stringify(result.messages)}`);
    }
  });
}

test('anonymous default exports are still reported', async () => {
  const [result] = await eslint.lintText('export default { value: 1 };', {
    filePath: 'lib/lint-probe.mjs',
  });
  assert.equal(result.fatalErrorCount, 0);
  assert.ok(result.messages.some(message => message.ruleId === 'import/no-anonymous-default-export'));
});

test('valid typed JSX passes the migrated parser and rules', async () => {
  const [result] = await eslint.lintText(`
    export default function Example({ label }: { label: string }) {
      return <button type="button">{label}</button>;
    }
  `, { filePath: 'app/components/LintProbe.tsx' });
  assert.deepEqual(result.messages, []);
});
