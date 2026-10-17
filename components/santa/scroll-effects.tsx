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
      item.style.setProperty("--reveal-delay", `${(index % 4) * 45}ms`);

      if (item.matches(".experience-story")) {
        const siblings = Array.from(item.parentElement?.children ?? []);
        const itemIndex = siblings.indexOf(item);
        item.classList.add(itemIndex % 2 === 0 ? "scroll-reveal--left" : "scroll-reveal--right");
      }
    });

    root.classList.add("motion-ready");

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(sectionSelectors.join(",")),
    );

    sections.forEach((section) => section.classList.add("motion-section"));

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      sections.forEach((section) => section.classList.add("is-section-visible"));
      return;
    }

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
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px",
      },
    );

    items.forEach((item) => observer.observe(item));

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
      root.classList.toggle("is-scrolled", window.scrollY > 24);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      sectionObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
