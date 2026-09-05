/* ======================
    JETPACK IMAGE COMPARE
    (Before/After slider)
 ====================== */

export function enhanceImageCompare(scope: ParentNode = document): () => void {
  const figures = scope.querySelectorAll<HTMLElement>("figure.wp-block-jetpack-image-compare");
  const pending = Array.from(figures).filter((figure) => !figure.closest('.ko-compare'));
  const pointerCleanups: Array<() => void> = [];

  const enhance = (figure: HTMLElement, index: number) => {
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
    // A lightbox may have prepared the source images before the lazy enhancer runs.
    for (const image of [beforeClone, afterClone]) for (const attribute of ['role', 'tabindex', 'aria-label']) image.removeAttribute(attribute);

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

    const range = document.createElement('input');
    range.type = 'range'; range.min = '0'; range.max = '100'; range.value = '50';
    range.className = 'ko-compare__range';
    range.setAttribute('aria-label', 'Image comparison position');
    range.addEventListener('input', () => sync(range.value));

    const sync = (value: number | string) => {
      const v = Math.max(0, Math.min(100, Number(value)));
      wrapper.style.setProperty("--pos", `${v}%`);
      range.value = String(v);
      range.setAttribute("aria-valuetext", `${v}% before image`);
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
    pointerCleanups.push(onPointerUp);

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
    wrapper.appendChild(range);
    sync(50);

    // Re-attach the caption after the slider so existing caption styles still apply
    if (caption) wrapper.appendChild(caption);

    figure.replaceWith(wrapper);
  };

  if (!('IntersectionObserver' in window)) {
    pending.forEach(enhance);
    return () => pointerCleanups.forEach((cleanup) => cleanup());
  }

  const indexes = new Map(pending.map((figure, index) => [figure, index]));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const figure = entry.target as HTMLElement;
        observer.unobserve(figure);
        enhance(figure, indexes.get(figure) || 0);
      });
    },
    { rootMargin: '800px 0px' }
  );

  pending.forEach((figure) => observer.observe(figure));
  return () => {
    observer.disconnect();
    pointerCleanups.forEach((cleanup) => cleanup());
  };
}
