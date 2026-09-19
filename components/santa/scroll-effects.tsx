"use client";

import { useEffect } from "react";

const revealSelectors = [
  ".home-story > *",
  ".section-title-row > *",
  ".home-experience-card",
  ".visit-path__steps article",
  ".home-gallery__item",
  ".home-faq > *",
  ".home-invite > *",
  ".page-hero--split > *",
  ".editorial-story > *",
  ".meet-collage figure",
  ".values-grid article",
  ".experience-story",
  ".page-banner > *",
  ".gallery-page__content",
  ".reel-page > *",
  ".faq-page__body > *",
  ".page-cta > *",
  ".invite-intro > *",
  ".invite-form-section > *",
  ".site-footer > *",
];

export function ScrollEffects() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".site-page");
    if (!root) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      root.classList.add("motion-reduced");
      return;
    }

    const items = Array.from(
      document.querySelectorAll<HTMLElement>(revealSelectors.join(",")),
    );

    items.forEach((item, index) => {
      item.classList.add("scroll-reveal");
      item.style.setProperty("--reveal-delay", `${Math.min((index % 6) * 70, 350)}ms`);

      if (item.matches(".experience-story")) {
        const siblings = Array.from(item.parentElement?.children ?? []);
        const itemIndex = siblings.indexOf(item);
        item.classList.add(itemIndex % 2 === 0 ? "scroll-reveal--left" : "scroll-reveal--right");
      }
    });

    root.classList.add("motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          target.classList.add("is-visible");
          observer.unobserve(target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    items.forEach((item) => observer.observe(item));

    let frame = 0;
    const updateScroll = () => {
      frame = 0;
      const y = window.scrollY;
      root.classList.toggle("is-scrolled", y > 24);
      root.style.setProperty("--parallax-slow", `${Math.min(y * 0.035, 42)}px`);
      root.style.setProperty("--parallax-fast", `${Math.min(y * 0.065, 78)}px`);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScroll);
    };

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer) return;
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      root.style.setProperty("--pointer-x", x.toFixed(3));
      root.style.setProperty("--pointer-y", y.toFixed(3));
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
