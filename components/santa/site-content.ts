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
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/6edb448a-4e96-4f10-b91e-2796b958e4dd.jpg", alt: "Santa Jim of Baton Rouge holding a young child during a holiday visit", caption: "A little Christmas magic", category: "Families" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/c517d5dd-83dd-486b-a663-e9238126f51c.jpg", alt: "Santa Jim of Baton Rouge posing with three guests at a holiday gathering", caption: "Christmas with friends", category: "Community" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/6cda91c0-488b-4179-b33a-d97ccd7c3020.jpg", alt: "Santa Jim of Baton Rouge sharing a playful group portrait with holiday guests", caption: "Plenty of personality", category: "Community" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/d5fa7810-c294-4933-aac2-f8307d614f94.jpg", alt: "Santa Jim of Baton Rouge holding a sleeping baby during a Christmas photo session", caption: "Quiet Christmas moments", category: "Families" },
  { src: "/images/santa-gallery-2024-05.webp", alt: "Santa Jim of Baton Rouge surrounded by a family group for a Christmas portrait", caption: "Family traditions together", category: "Families" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/354636fc-c32d-4a18-84e7-281c8fac028b.jpg", alt: "Santa Jim of Baton Rouge pointing upward with a young visitor during a holiday photo", caption: "Looking for Christmas magic", category: "Families" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/061d16cd-84fc-41de-831c-6d3cc11b6171.jpg", alt: "Santa Jim of Baton Rouge posing with a guest and a large dog", caption: "Pets are part of the family", category: "Pets" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/16f2ed49-c982-4492-897a-d0bc25422c17.jpg", alt: "Santa Jim of Baton Rouge surrounded by a cheerful group of teenagers", caption: "Holiday fun for every age", category: "Families" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/f29c21df-cab8-4c77-84ab-1de374beec18.jpg", alt: "Santa Jim of Baton Rouge sharing a playful Christmas moment with a group of guests", caption: "Secrets for Santa", category: "Community" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/8945f58b-98ba-4fad-b539-6810e898b38e.jpg", alt: "Santa Jim of Baton Rouge posing with a festive costumed group", caption: "A Christmas crew", category: "Community" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/56575c23-19a5-4dc7-ae64-927c1aeafec1.jpg", alt: "Santa Jim of Baton Rouge standing beside a smiling guest using a wheelchair", caption: "Christmas joy for everyone", category: "Families" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/6b25d035-92ca-4068-9b05-cc56e9af9703.jpg", alt: "Santa Jim of Baton Rouge hugging a young visitor during a Christmas portrait", caption: "The best kind of hug", category: "Families" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/6a4dc678-ccff-4f9a-9dc6-81ca864f24cb.jpg", alt: "Santa Jim of Baton Rouge reading a Christmas story to children gathered around him", caption: "Storytime with Santa", category: "Families" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/b91ec326-845b-4755-a3e5-946bd66974d2.jpg", alt: "Santa Jim of Baton Rouge sharing a Christmas story with a group of holiday guests", caption: "Gathered around Santa", category: "Community" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/5105b102-79e1-4299-82ff-72bce1f580e7.jpg", alt: "Santa Jim of Baton Rouge comforting a baby during a Christmas visit", caption: "Every reaction is part of the memory", category: "Families" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/ab5bb24f-588d-4f4b-b449-27a873264a9c.jpg", alt: "Santa Jim of Baton Rouge smiling with a delighted baby during a holiday portrait", caption: "Big Christmas smiles", category: "Families" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/9899543f-6b48-4601-b158-f8e0cb9a8689.jpg", alt: "Santa Jim of Baton Rouge posing beside a smiling young guest using a wheelchair", caption: "A warm welcome for every guest", category: "Families" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/f3ae38d5-b855-44ed-b14f-e393688d06cf.jpg", alt: "Santa Jim of Baton Rouge reading The Night Before Christmas during a playful holiday moment", caption: "A very special storytime", category: "Families" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/381ec308-ae65-4121-be5d-00c850ecf844.jpg", alt: "Santa Jim of Baton Rouge with a community group in front of a giant illuminated Christmas tree", caption: "Christmas in the community", category: "Community" },
  { src: "https://d2ol7oe51mr4n9.cloudfront.net/user_3Ghx6eM94FIgc0dL0R4UmDe1Olz/826cecf6-e9cd-4706-953e-03ab330978da.jpg", alt: "Santa Jim of Baton Rouge waving in front of a giant illuminated Christmas tree", caption: "Santa Jim under the lights", category: "Portraits" },
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
