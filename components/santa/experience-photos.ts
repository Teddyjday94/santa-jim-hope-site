export type ExperiencePhoto = {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  mobileFit?: "cover" | "contain";
  position?: string;
  mobilePosition?: string;
};

export const experiencePhotos: Record<string, ExperiencePhoto> = {
  "Home visits": {
    src: "/images/santa-jim-hope-throne-family.jpg",
    alt: "Santa Jim of Baton Rouge sharing a Christmas moment with a family",
    fit: "contain",
    position: "center center",
    mobileFit: "contain",
    mobilePosition: "center center",
  },
  "Birthday surprises": {
    src: "/images/jim-hope-elf.webp",
    alt: "Santa Jim of Baton Rouge smiling with a young guest dressed for a festive Christmas celebration",
    position: "center 34%",
    mobileFit: "contain",
    mobilePosition: "center center",
  },
  "Corporate events": {
    src: "/images/jim-hope-community.webp",
    alt: "Santa Jim of Baton Rouge posing with guests at a holiday event",
    position: "center 34%",
    mobileFit: "contain",
    mobilePosition: "center center",
  },
  "Schools & groups": {
    src: "/images/santa-jim-hope-group-celebration.jpg",
    alt: "Santa Jim of Baton Rouge posing with a large group at a holiday celebration",
    fit: "contain",
    mobileFit: "contain",
    position: "center center",
    mobilePosition: "center center",
  },
  "Community celebrations": {
    src: "/images/santa-jim-hope-community-tree.jpg",
    alt: "Santa Jim of Baton Rouge at a decorated community Christmas display",
    position: "center 32%",
    mobileFit: "contain",
    mobilePosition: "center center",
  },
  "Photo sessions": {
    src: "/images/santa-jim-hope-holiday-swing.jpg",
    alt: "Santa Jim of Baton Rouge posing in a polished holiday portrait setting",
    position: "center 36%",
    mobileFit: "contain",
    mobilePosition: "center center",
  },
};
