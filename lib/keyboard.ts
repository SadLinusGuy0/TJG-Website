/** Single-key shortcuts must not consume text entry or widget navigation. */
export function isKeyboardInput(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="menu"], [role="dialog"]'));
}
