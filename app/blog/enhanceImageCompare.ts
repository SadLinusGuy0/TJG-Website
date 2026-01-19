/* ======================
    JETPACK IMAGE COMPARE
    (Before/After slider)
 ====================== */

export function enhanceImageCompare(scope: ParentNode = document) {
  const figures = scope.querySelectorAll<HTMLElement>("figure.wp-block-jetpack-image-compare");

  figures.forEach((figure, index) => {
    // If Jetpack already enhanced this block (or we've already replaced it), skip.
    if (figure.closest(".ko-compare")) return;

    const juxtapose = figure.querySelector<HTMLElement>(".juxtapose");
    const imgs = (juxtapose || figure).querySelectorAll<HTMLImageElement>("img");
    if (imgs.length < 2) return;

    const before = imgs[0];
    const after = imgs[1];

    const beforeClone = before.cloneNode(true) as HTMLImageElement;
    const afterClone = after.cloneNode(true) as HTMLImageElement;

    // Avoid duplicate IDs after cloning
    beforeClone.removeAttribute("id");
    afterClone.removeAttribute("id");

    // Use a11y-friendly alts if missing
    if (!beforeClone.getAttribute("alt")) beforeClone.setAttribute("alt", "Before image");
    if (!afterClone.getAttribute("alt")) afterClone.setAttribute("alt", "After image");

    // Preserve caption if present
    const caption = figure.querySelector("figcaption");

    const wrapper = document.createElement("figure");
    wrapper.className = "ko-compare";
    wrapper.style.setProperty("--pos", "50%");
    wrapper.dataset.compareIndex = String(index);

    const viewport = document.createElement("div");
    viewport.className = "ko-compare__viewport";

    beforeClone.classList.add("ko-compare__img", "ko-compare__img--before");
    afterClone.classList.add("ko-compare__img", "ko-compare__img--after");

    const handle = document.createElement("div");
    handle.className = "ko-compare__handle";
    handle.setAttribute("aria-hidden", "true");

    const sync = (value: number | string) => {
      const v = Math.max(0, Math.min(100, Number(value)));
      wrapper.style.setProperty("--pos", `${v}%`);
    };

    // Pointer interaction anywhere on the image area
    const updateFromPointer = (clientX: number) => {
      const rect = viewport.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      sync(Math.round(ratio * 100));
    };

    const onPointerMove = (e: PointerEvent) => updateFromPointer(e.clientX);
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    viewport.addEventListener("pointerdown", (e) => {
      // Don't block link clicks inside content (rare, but safe)
      if ((e.target as Element | null)?.closest?.("a")) return;
      updateFromPointer(e.clientX);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    });

    // Best-effort: set aspect ratio to stabilize layout + enable object-fit: cover cropping.
    const setAspectRatio = () => {
      const widthAttr = Number(beforeClone.getAttribute("width")) || Number(afterClone.getAttribute("width")) || 0;
      const heightAttr = Number(beforeClone.getAttribute("height")) || Number(afterClone.getAttribute("height")) || 0;

      const w = widthAttr || beforeClone.naturalWidth || afterClone.naturalWidth || 0;
      const h = heightAttr || beforeClone.naturalHeight || afterClone.naturalHeight || 0;

      if (w > 0 && h > 0) {
        wrapper.style.setProperty("--ar", `${w} / ${h}`);
      }
    };

    if (beforeClone.complete && afterClone.complete) {
      setAspectRatio();
    } else {
      beforeClone.addEventListener("load", setAspectRatio, { once: true });
      afterClone.addEventListener("load", setAspectRatio, { once: true });
    }

    viewport.appendChild(beforeClone);
    viewport.appendChild(afterClone);
    viewport.appendChild(handle);

    wrapper.appendChild(viewport);

    // Re-attach the caption after the slider so existing caption styles still apply
    if (caption) wrapper.appendChild(caption);

    figure.replaceWith(wrapper);
  });
}

