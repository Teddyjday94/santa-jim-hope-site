import { garlandData1 } from "@/components/santa/garland-data-1";
import { garlandData2 } from "@/components/santa/garland-data-2";
import { garlandData3 } from "@/components/santa/garland-data-3";
import { garlandData4 } from "@/components/santa/garland-data-4";

type SeasonalEvergreenTrimProps = {
  side: "left" | "right";
};

const garlandSrc =
  `data:image/webp;base64,${garlandData1}${garlandData2}${garlandData3}${garlandData4}`;

export function SeasonalEvergreenTrim({ side }: SeasonalEvergreenTrimProps) {
  return (
    <div className={`seasonal-trim seasonal-trim--${side}`} aria-hidden="true">
      <img
        className="seasonal-trim__image"
        src={garlandSrc}
        alt=""
        draggable={false}
      />
    </div>
  );
}
