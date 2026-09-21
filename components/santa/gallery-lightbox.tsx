"use client";

import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { GalleryItem } from "@/components/santa/site-content";

type GalleryLightboxProps = {
  items: GalleryItem[];
};

const hostedGalleryPrefix = "https://d2ol7oe51mr4n9.cloudfront.net/";

function galleryImageSrc(src: string) {
  if (!src.startsWith(hostedGalleryPrefix)) return src;
  return `/api/santa/gallery-media?src=${encodeURIComponent(src)}`;
}

export function GalleryLightbox({ items }: GalleryLightboxProps) {
  const categories = useMemo(
    () => ["All moments", ...Array.from(new Set(items.map((item) => item.category)))],
    [items],
  );
  const [activeCategory, setActiveCategory] = useState("All moments");
  const [selectedSrc, setSelectedSrc] = useState<string | null>(null);

  const visibleItems = useMemo(
    () => activeCategory === "All moments"
      ? items
      : items.filter((item) => item.category === activeCategory),
    [activeCategory, items],
  );

  const selectedIndex = selectedSrc
    ? visibleItems.findIndex((item) => item.src === selectedSrc)
    : -1;
  const selectedItem = selectedIndex >= 0 ? visibleItems[selectedIndex] : null;

  useEffect(() => {
    if (!selectedItem) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedSrc(null);
      if (event.key === "ArrowLeft") {
        const nextIndex = (selectedIndex - 1 + visibleItems.length) % visibleItems.length;
        setSelectedSrc(visibleItems[nextIndex]?.src ?? null);
      }
      if (event.key === "ArrowRight") {
        const nextIndex = (selectedIndex + 1) % visibleItems.length;
        setSelectedSrc(visibleItems[nextIndex]?.src ?? null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedIndex, selectedItem, visibleItems]);

  function showPrevious() {
    if (selectedIndex < 0) return;
    const nextIndex = (selectedIndex - 1 + visibleItems.length) % visibleItems.length;
    setSelectedSrc(visibleItems[nextIndex]?.src ?? null);
  }

  function showNext() {
    if (selectedIndex < 0) return;
    const nextIndex = (selectedIndex + 1) % visibleItems.length;
    setSelectedSrc(visibleItems[nextIndex]?.src ?? null);
  }

  return (
    <>
      <div className="gallery-filters" aria-label="Filter Santa Jim photos">
        {categories.map((category) => (
          <button
            className={category === activeCategory ? "gallery-filter is-active" : "gallery-filter"}
            key={category}
            type="button"
            onClick={() => {
              setActiveCategory(category);
              setSelectedSrc(null);
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {visibleItems.map((item, index) => (
          <button
            className={`gallery-card gallery-card--${(index % 5) + 1}`}
            key={item.src}
            type="button"
            onClick={() => setSelectedSrc(item.src)}
            aria-label={`Open ${item.caption} photo`}
          >
            <img
              src={galleryImageSrc(item.src)}
              alt={item.alt}
              loading={index < 6 ? "eager" : "lazy"}
              decoding="async"
            />
            <span className="gallery-card__caption">
              <span>{item.caption}</span>
              <span className="gallery-card__expand" aria-hidden="true">
                <Maximize2 size={16} />
              </span>
            </span>
          </button>
        ))}
      </div>

      {selectedItem ? (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedItem.caption} enlarged photo`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedSrc(null);
          }}
        >
          <button
            className="gallery-lightbox__close"
            type="button"
            onClick={() => setSelectedSrc(null)}
            aria-label="Close enlarged photo"
          >
            <X size={22} />
          </button>

          {visibleItems.length > 1 ? (
            <button
              className="gallery-lightbox__nav gallery-lightbox__nav--previous"
              type="button"
              onClick={showPrevious}
              aria-label="Previous photo"
            >
              <ChevronLeft size={28} />
            </button>
          ) : null}

          <figure className="gallery-lightbox__figure">
            <div className="gallery-lightbox__image">
              <img
                src={galleryImageSrc(selectedItem.src)}
                alt={selectedItem.alt}
                decoding="async"
              />
            </div>
            <figcaption>
              <span>{selectedItem.caption}</span>
              <small>{selectedItem.category}</small>
            </figcaption>
          </figure>

          {visibleItems.length > 1 ? (
            <button
              className="gallery-lightbox__nav gallery-lightbox__nav--next"
              type="button"
              onClick={showNext}
              aria-label="Next photo"
            >
              <ChevronRight size={28} />
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
