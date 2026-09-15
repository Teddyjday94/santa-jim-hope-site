export type ExperiencePhoto = {
  src: string;
  alt: string;
};

export const experiencePhotos: Record<string, ExperiencePhoto> = {
  "Home visits": {
    src: "/images/jim-hope-storytime.webp",
    alt: "Santa Jim Hope sharing a quiet Christmas storytime moment during a family visit",
  },
  "Birthday surprises": {
    src: "/images/jim-hope-elf.webp",
    alt: "Santa Jim Hope smiling with a young guest dressed for a festive Christmas celebration",
  },
  "Corporate events": {
    src: "/images/santa-jim-hope-group-celebration.jpg",
    alt: "Santa Jim Hope posing with a large group at a holiday celebration",
  },
  "Schools & groups": {
    src: "/images/jim-hope-inclusive-visit.webp",
    alt: "Santa Jim Hope sharing a welcoming visit with a young guest",
  },
  "Community celebrations": {
    src: "/images/santa-jim-hope-community-tree.jpg",
    alt: "Santa Jim Hope at a decorated community Christmas display",
  },
  "Photo sessions": {
    src: "/images/santa-jim-hope-holiday-swing.jpg",
    alt: "Santa Jim Hope posing in a polished holiday portrait setting",
  },
};
