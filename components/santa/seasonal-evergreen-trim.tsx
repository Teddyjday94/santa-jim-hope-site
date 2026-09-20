type SeasonalEvergreenTrimProps = {
  side: "left" | "right";
};

export function SeasonalEvergreenTrim({ side }: SeasonalEvergreenTrimProps) {
  return (
    <div className={`seasonal-trim seasonal-trim--${side}`} aria-hidden="true">
      <img
        className="seasonal-trim__image"
        src="/images/christmas-side-garland.webp"
        alt=""
      />
    </div>
  );
}
