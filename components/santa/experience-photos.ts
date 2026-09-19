export type ExperiencePhoto = {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  position?: string;
};

export const experiencePhotos: Record<string, ExperiencePhoto> = {
  "Home visits": {
    src: "/images/jim-hope-storytime.webp",
    alt: "Santa Jim Hope sharing a quiet Christmas storytime moment during a family visit",
    position: "center 38%",
  },
  "Birthday surprises": {
    src: "/images/jim-hope-elf.webp",
    alt: "Santa Jim Hope smiling with a young guest dressed for a festive Christmas celebration",
    position: "center 34%",
  },
  "Corporate events": {
    src: "/images/jim-hope-community.webp",
    alt: "Santa Jim Hope posing with guests at a holiday event",
    position: "center 34%",
  },
  "Schools & groups": {
    src: "/images/santa-jim-hope-group-celebration.jpg",
    alt: "Santa Jim Hope posing with a large group at a holiday celebration",
    fit: "contain",
    position: "center center",
  },
  "Community celebrations": {
    src: "/images/santa-jim-hope-community-tree.jpg",
    alt: "Santa Jim Hope at a decorated community Christmas display",
    position: "center 32%",
  },
  "Photo sessions": {
    src: "/images/santa-jim-hope-holiday-swing.jpg",
    alt: "Santa Jim Hope posing in a polished holiday portrait setting",
    position: "center 36%",
  },
};
