const section = document.querySelector("#hero-carousel2");
const track = section?.querySelector(".carousel-track");
const viewport = section?.querySelector(".carousel-viewport");
const prevButton = section?.querySelector(".carousel-nav-prev");
const nextButton = section?.querySelector(".carousel-nav-next");

if (section && track && viewport && prevButton && nextButton) {
  const initialItems = [...track.children];
  if (initialItems.length > 1) {
    track.innerHTML += track.innerHTML;

    let position = 0;
    const speed = -1.1;
    let paused = false;
    let dragging = false;
    let dragStartX = 0;
    let dragStartPosition = 0;
    let lastPointerX = 0;
    let resumeTimeoutId = null;

    const getGap = () => Number.parseFloat(getComputedStyle(track).gap) || 0;
    const getItemWidth = () => {
      const firstItem = track.querySelector(".smed-carousel-item");
      if (!firstItem) return 350;
      return firstItem.getBoundingClientRect().width;
    };
    const getStep = () => getItemWidth() + getGap();
    const getLoopWidth = () => track.scrollWidth / 2;

    const normalizePosition = () => {
      const loopWidth = getLoopWidth();
      if (position <= -loopWidth) position += loopWidth;
      if (position > 0) position -= loopWidth;
    };

    const getClosestEquivalentTarget = (target) => {
      const loopWidth = getLoopWidth();
      let adjusted = target;
      while (adjusted - position > loopWidth / 2) adjusted -= loopWidth;
      while (position - adjusted > loopWidth / 2) adjusted += loopWidth;
      return adjusted;
    };

    const getCenteredPositionForIndex = (index) => {
      const viewportCenter = viewport.clientWidth / 2;
      const stepSize = getStep();
      const itemHalf = getItemWidth() / 2;
      return viewportCenter - (index * stepSize + itemHalf);
    };

    const getClosestCardIndex = () => {
      const totalCards = track.children.length;
      const viewportCenter = viewport.clientWidth / 2;
      const stepSize = getStep();
      const itemHalf = getItemWidth() / 2;

      let bestIndex = 0;
      let minDistance = Number.POSITIVE_INFINITY;

      for (let index = 0; index < totalCards; index += 1) {
        const cardCenter = position + index * stepSize + itemHalf;
        const distance = Math.abs(cardCenter - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          bestIndex = index;
        }
      }

      return bestIndex;
    };

    const originalCount = initialItems.length;
    const dots = [...document.querySelectorAll('#carouselDots .cdot')];

    const updateActiveCard = () => {
      const idx = getClosestCardIndex() % originalCount;
      [...track.children].forEach((card, i) => {
        card.classList.toggle('active', i % originalCount === idx);
      });
      dots.forEach((dot, i) => dot.classList.toggle('active', i === idx));
    };

    const render = () => {
      track.style.transform = `translateX(${position}px)`;
      updateActiveCard();
    };

    const clearResumeTimer = () => {
      if (resumeTimeoutId) {
        clearTimeout(resumeTimeoutId);
        resumeTimeoutId = null;
      }
    };

    const pause = () => {
      paused = true;
      clearResumeTimer();
    };

    const resumeLater = (delay = 1200) => {
      clearResumeTimer();
      resumeTimeoutId = setTimeout(() => {
        paused = false;
      }, delay);
    };

    const animateTo = (target, duration = 320) => {
      pause();
      const start = position;
      const delta = target - start;
      const startTime = performance.now();

      const step = (now) => {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = 1 - (1 - t) * (1 - t);
        position = start + delta * eased;
        normalizePosition();
        render();

        if (t < 1) {
          requestAnimationFrame(step);
          return;
        }

        resumeLater();
      };

      requestAnimationFrame(step);
    };

    const snapToCard = (index, duration = 320) => {
      const totalCards = track.children.length;
      const wrappedIndex = ((index % totalCards) + totalCards) % totalCards;
      const centeredTarget = getCenteredPositionForIndex(wrappedIndex);
      const target = getClosestEquivalentTarget(centeredTarget);
      animateTo(target, duration);
    };

    const moveByDirection = (direction) => {
      const currentIndex = getClosestCardIndex();
      snapToCard(currentIndex + direction, 360);
    };

    const loop = () => {
      if (!paused && !dragging) {
        position += speed;
        normalizePosition();
        render();
      }
      requestAnimationFrame(loop);
    };

    prevButton.addEventListener("click", () => moveByDirection(-1));
    nextButton.addEventListener("click", () => moveByDirection(1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => snapToCard(i, 360)));

    // En desktop no se pausa por hover; solo se pausa por interacción explícita.

    viewport.addEventListener("pointerdown", (event) => {
      dragging = true;
      pause();
      dragStartX = event.clientX;
      lastPointerX = event.clientX;
      dragStartPosition = position;
      viewport.classList.add("is-dragging");
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      lastPointerX = event.clientX;
      const deltaX = lastPointerX - dragStartX;
      position = dragStartPosition + deltaX;
      normalizePosition();
      render();
    });

    const finishDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove("is-dragging");
      if (event.pointerId !== undefined) {
        viewport.releasePointerCapture(event.pointerId);
      }

      const dragDistance = lastPointerX - dragStartX;
      if (Math.abs(dragDistance) > 60) {
        moveByDirection(dragDistance < 0 ? 1 : -1);
        return;
      }

      snapToCard(getClosestCardIndex(), 260);
    };

    viewport.addEventListener("pointerup", finishDrag);
    viewport.addEventListener("pointercancel", finishDrag);
    viewport.addEventListener("pointerleave", (event) => {
      if (dragging) finishDrag(event);
    });

    window.addEventListener("resize", () => {
      const currentIndex = getClosestCardIndex();
      position = getClosestEquivalentTarget(getCenteredPositionForIndex(currentIndex));
      normalizePosition();
      render();
    });

    position = getClosestEquivalentTarget(getCenteredPositionForIndex(0));
    normalizePosition();
    render();
    loop();
  }
}
