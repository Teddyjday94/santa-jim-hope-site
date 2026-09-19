"use client";

import { useEffect } from "react";

const sectionSelectors = [
  ".home-story",
  ".home-experiences",
  ".visit-path",
  ".home-gallery",
  ".home-faq",
  ".home-invite",
  ".editorial-story",
  ".meet-collage",
  ".values-section",
  ".experience-stories",
  ".visit-path--dark",
  ".gallery-page__content",
  ".reel-page",
  ".faq-page__body",
  ".page-cta",
  ".invite-intro",
  ".invite-form-section",
];

const revealSelectors = [
  ".home-story > *",
  ".section-title-row > *",
  ".home-experience-card",
  ".visit-path__steps article",
  ".home-gallery__item",
  ".home-faq > *",
  ".home-invite > *",
  ".editorial-story > *",
  ".meet-collage figure",
  ".values-grid article",
  ".experience-story",
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

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(sectionSelectors.join(",")),
    );

    sections.forEach((section) => section.classList.add("motion-section"));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          target.classList.add("is-section-visible");
          sectionObserver.unobserve(target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    sections.forEach((section) => sectionObserver.observe(section));

    let frame = 0;
    const updateScroll = () => {
      frame = 0;
      const y = window.scrollY;
      root.classList.toggle("is-scrolled", y > 24);
      root.style.setProperty("--parallax-slow", `${Math.min(y * 0.035, 42)}px`);
      root.style.setProperty("--parallax-fast", `${Math.min(y * 0.065, 78)}px`);
      root.style.setProperty("--trim-left", `${Math.min(y * 0.022, 30)}px`);
      root.style.setProperty("--trim-right", `${Math.max(y * -0.018, -26)}px`);
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
      root.style.setProperty("--pointer-x", `${(x * 12).toFixed(2)}px`);
      root.style.setProperty("--pointer-y", `${(y * 9).toFixed(2)}px`);
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
