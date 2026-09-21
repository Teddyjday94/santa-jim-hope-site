export type Experience = {
  title: string;
  kicker: string;
  description: string;
  iconSrc: string;
};

export type VisitStep = {
  label: string;
  title: string;
  description: string;
  iconSrc: string;
};

export type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
  category: string;
};

export type SocialReel = { reelId: string; title: string; caption: string };
export type FaqItem = { question: string; answer: string };
export type Snowflake = {
  id: number;
  symbol: "❄︎" | "❅" | "❆";
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
};

export const ambientOrbs = ["one", "three"] as const;

export const snowflakes: Snowflake[] = [
  { id: 1, symbol: "❄︎", left: 3, size: 1.15, duration: 19, delay: 3, drift: 5 },
  { id: 2, symbol: "❅", left: 9, size: 0.72, duration: 14, delay: 11, drift: -4 },
  { id: 3, symbol: "❆", left: 16, size: 1.45, duration: 23, delay: 17, drift: 7 },
  { id: 4, symbol: "❄︎", left: 23, size: 0.85, duration: 16, delay: 6, drift: -6 },
  { id: 5, symbol: "❅", left: 31, size: 1.05, duration: 21, delay: 14, drift: 4 },
  { id: 6, symbol: "❆", left: 38, size: 0.68, duration: 15, delay: 1, drift: -3 },
  { id: 7, symbol: "❄︎", left: 44, size: 1.3, duration: 20, delay: 9, drift: 6 },
  { id: 8, symbol: "❅", left: 51, size: 0.78, duration: 17, delay: 15, drift: -5 },
  { id: 9, symbol: "❆", left: 57, size: 1.5, duration: 25, delay: 20, drift: 8 },
  { id: 10, symbol: "❄︎", left: 64, size: 0.9, duration: 16, delay: 8, drift: -4 },
  { id: 11, symbol: "❅", left: 71, size: 1.18, duration: 22, delay: 13, drift: 5 },
  { id: 12, symbol: "❆", left: 77, size: 0.7, duration: 14, delay: 4, drift: -6 },
  { id: 13, symbol: "❄︎", left: 83, size: 1.38, duration: 24, delay: 18, drift: 4 },
  { id: 14, symbol: "❅", left: 89, size: 0.82, duration: 18, delay: 10, drift: -5 },
  { id: 15, symbol: "❆", left: 94, size: 1.1, duration: 20, delay: 16, drift: 3 },
  { id: 16, symbol: "❄︎", left: 98, size: 0.62, duration: 15, delay: 7, drift: -7 },
];

export const santaProfile = {
  name: "Santa Jim of Baton Rouge",
  displayName: "Santa Jim of Baton Rouge",
  shortName: "Santa Jim",
} as const;

export const heroMedia = {
  posterSrc: "/images/jim-hope-throne.webp",
  videoSrc: "/videos/jim-hope-christmas-loop.mp4",
  alt: "Santa Jim of Baton Rouge seated on an ornate holiday throne",
} as const;

export const experiences: Experience[] = [
  {
    title: "Home visits",
    kicker: "At home",
    description: "A personal visit shaped around your family's Christmas traditions and the moments you want everyone to remember.",
    iconSrc: "/icons/north-pole-home.webp",
  },
  {
    title: "Birthday surprises",
    kicker: "Seasonal birthdays",
    description: "A joyful Santa appearance for a birthday celebrated during the Christmas season.",
    iconSrc: "/icons/north-pole-birthday.webp",
  },
  {
    title: "Corporate events",
    kicker: "Teams and guests",
    description: "A polished holiday presence for company gatherings, customer celebrations, and seasonal events.",
    iconSrc: "/icons/north-pole-corporate.webp",
  },
  {
    title: "Schools & groups",
    kicker: "Classrooms and organizations",
    description: "A warm, age-aware visit for classrooms, churches, youth groups, and other organizations.",
    iconSrc: "/icons/north-pole-school.webp",
  },
  {
    title: "Community celebrations",
    kicker: "Festivals and traditions",
    description: "A welcoming Santa presence for markets, neighborhood traditions, festivals, and community gatherings.",
    iconSrc: "/icons/north-pole-community.webp",
  },
  {
    title: "Photo sessions",
    kicker: "Camera-ready moments",
    description: "A calm, photo-ready experience coordinated with your photographer, studio, venue, or event team.",
    iconSrc: "/icons/north-pole-camera.webp",
  },
];

export const visitSteps: VisitStep[] = [
  {
    label: "First hello",
    title: "Send the details",
    description: "Share your preferred date, location, event type, timing, and the size of your gathering.",
    iconSrc: "/icons/north-pole-letter.webp",
  },
  {
    label: "Make it yours",
    title: "Shape the visit",
    description: "Once the date is confirmed, share the traditions, names, surprises, and special moments that matter to your group.",
    iconSrc: "/icons/north-pole-list.webp",
  },
  {
    label: "The big arrival",
    title: "Welcome Santa",
    description: "Gather your guests and enjoy a visit designed to feel warm, natural, photo-ready, and memorable.",
    iconSrc: "/icons/north-pole-bell.webp",
  },
];

export const galleryItems: GalleryItem[] = [
  { src: "/images/jim-hope-throne.webp", alt: "Santa Jim of Baton Rouge seated on an ornate holiday throne", caption: "Santa Jim · 2025", category: "Portraits" },
  { src: "/images/jim-hope-storytime.webp", alt: "Santa Jim of Baton Rouge reading a Christmas story with a baby", caption: "Storytime visits", category: "Families" },
  { src: "/images/jim-hope-dog.webp", alt: "Santa Jim of Baton Rouge smiling while holding a small dog", caption: "Pet-friendly moments", category: "Pets" },
  { src: "/images/jim-hope-group-2024.webp", alt: "Santa Jim of Baton Rouge posing with a large group at a 2024 holiday gathering", caption: "Community celebrations", category: "Community" },
  { src: "/images/jim-hope-baby.webp", alt: "Santa Jim of Baton Rouge holding a baby during a Christmas visit", caption: "Little first Christmases", category: "Families" },
  { src: "/images/jim-hope-inclusive-visit.webp", alt: "Santa Jim of Baton Rouge visiting with a child using a wheelchair", caption: "Welcoming visits", category: "Families" },
  { src: "/images/jim-hope-community.webp", alt: "Santa Jim of Baton Rouge posing with two guests at a holiday event", caption: "Festive gatherings", category: "Community" },
  { src: "/images/jim-hope-hug.webp", alt: "A guest giving Santa Jim of Baton Rouge a joyful hug", caption: "Joyful moments", category: "Families" },
  { src: "/images/jim-hope-guest.webp", alt: "Santa Jim of Baton Rouge seated beside a guest for a holiday portrait", caption: "Portrait moments", category: "Portraits" },
  { src: "/images/jim-hope-elf.webp", alt: "Santa Jim of Baton Rouge seated with a young visitor dressed as an elf", caption: "Christmas wonder", category: "Families" },
  { src: "/images/santa-jim-hope-holiday-swing.jpg", alt: "Santa Jim of Baton Rouge seated with a guest on a decorated holiday swing", caption: "Christmas connections", category: "Portraits" },
  { src: "/images/santa-jim-hope-community-tree.jpg", alt: "Santa Jim of Baton Rouge seated beneath a glowing wreath at a community holiday display", caption: "Ready to welcome guests", category: "Community" },
  { src: "/images/santa-jim-hope-red-suit-portrait.jpg", alt: "Santa Jim of Baton Rouge standing in his red holiday suit", caption: "Santa Jim · 2025", category: "Portraits" },
  { src: "/images/santa-jim-hope-group-celebration.jpg", alt: "Santa Jim of Baton Rouge with a large group gathered beside a community Christmas tree", caption: "Holiday celebrations together", category: "Community" },
  { src: "/images/santa-jim-hope-mrs-claus-2025.jpg", alt: "Santa Jim of Baton Rouge and Mrs. Claus posing by a decorated Christmas throne", caption: "Santa and Mrs. Claus · 2025", category: "Santa & Mrs. Claus" },
  { src: "/images/santa-jim-hope-community-selfie.jpg", alt: "Santa Jim of Baton Rouge smiling for a selfie at a community Christmas gathering", caption: "A joyful day in the community", category: "Community" },
  { src: "/images/santa-jim-hope-throne-family.jpg", alt: "Santa Jim of Baton Rouge sharing a warm holiday moment with two young guests", caption: "Christmas wonder up close", category: "Families" },
];

export const socialReels: SocialReel[] = [
  { reelId: "4142406926072498", title: "Santa Jim of Baton Rouge community reel", caption: "Santa Jim in the community" },
];

export const faqs: FaqItem[] = [
  {
    question: "How early should I inquire?",
    answer: "Holiday dates can fill quickly. Send your preferred date and time as early as you can, and Santa Jim will confirm availability directly.",
  },
  {
    question: "Can the visit be personalized?",
    answer: "Yes. Use the inquiry notes to share the occasion, names, traditions, surprises, or special moments you would like Santa Jim to know about. Final visit details are confirmed before the event.",
  },
  {
    question: "What kinds of events can I ask about?",
    answer: "You can inquire about home visits, seasonal birthdays, schools, organizations, business events, community celebrations, and photo sessions.",
  },
  {
    question: "Where does Santa travel?",
    answer: "Include your event location with the inquiry. Santa Jim will confirm travel availability for your date and location when he follows up.",
  },
];
