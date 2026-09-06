import { test, expect } from '@playwright/test';

test('flag overrides persist, affect the home page, and reset to the baseline', async ({ page, context }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/settings/feature-flags');
  const toggle = page.locator('#flag-toggle-misc-section-enabled');
  await expect(toggle).toBeVisible();
  const baseline = await toggle.isChecked();
  await page.locator('label[for="flag-toggle-misc-section-enabled"]').click();
  await expect(toggle).toBeChecked({ checked: !baseline });
  expect((await context.cookies()).find(cookie => cookie.name === 'ff-misc-section-enabled')?.value).toBe(String(!baseline));
  await page.reload();
  await expect(toggle).toBeChecked({ checked: !baseline });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Misc', exact: true })).toHaveCount(baseline ? 0 : 1);
  await page.goto('/settings/feature-flags');
  await page.getByRole('button', { name: 'Reset all overrides' }).click();
  await expect(toggle).toBeChecked({ checked: baseline });
  expect((await context.cookies()).some(cookie => cookie.name === 'ff-misc-section-enabled')).toBe(false);
  await expect(page.locator('#flag-string-blog-content-source')).toHaveCount(0);
  await page.locator('#flag-string-blog-content-edition').selectOption('college');
  await page.reload();
  await expect(page.locator('#flag-string-blog-content-edition')).toHaveValue('college');
  await page.getByRole('button', { name: 'Reset all overrides' }).click();
  await expect(page.locator('#flag-string-blog-content-edition')).toHaveValue('auto');
  expect(errors).toEqual([]);
});
