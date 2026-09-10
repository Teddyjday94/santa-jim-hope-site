export type Experience = { title: string; description: string; iconSrc: string };
export type VisitStep = { number: string; title: string; description: string; iconSrc: string };
export type GalleryItem = { src: string; alt: string; caption: string };
export type SampleTestimonial = { quote: string; attribution: string };
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
  name: "Jim Hope",
  displayName: "Santa Jim Hope",
  shortName: "Santa Jim",
} as const;

export const heroMedia = {
  posterSrc: "/images/jim-hope-throne.webp",
  videoSrc: "/videos/jim-hope-christmas-loop.mp4",
  alt: "Santa Jim Hope seated on an ornate holiday throne",
} as const;

export const experiences: Experience[] = [
  { title: "Home visits", description: "A personal visit shaped around your family's Christmas traditions.", iconSrc: "/icons/north-pole-home.webp" },
  { title: "Birthday surprises", description: "A joyful Santa appearance for a birthday celebrated during the season.", iconSrc: "/icons/north-pole-birthday.webp" },
  { title: "Corporate events", description: "A polished holiday presence for team gatherings and customer celebrations.", iconSrc: "/icons/north-pole-corporate.webp" },
  { title: "Schools & groups", description: "A warm, age-aware visit for classrooms, churches, and youth organizations.", iconSrc: "/icons/north-pole-school.webp" },
  { title: "Community celebrations", description: "A welcoming Santa for festivals, markets, and neighborhood traditions.", iconSrc: "/icons/north-pole-community.webp" },
  { title: "Photo sessions", description: "A calm, camera-ready experience planned with your photographer or venue.", iconSrc: "/icons/north-pole-camera.webp" },
];

export const visitSteps: VisitStep[] = [
  { number: "01", title: "Send an inquiry", description: "Share your date, location, event type, and the size of your gathering.", iconSrc: "/icons/north-pole-letter.webp" },
  { number: "02", title: "Personalize the visit", description: "Once details are confirmed, shape the moments and traditions that matter to your group.", iconSrc: "/icons/north-pole-list.webp" },
  { number: "03", title: "Welcome Santa", description: "Gather your guests and enjoy a visit designed to feel warm, natural, and memorable.", iconSrc: "/icons/north-pole-bell.webp" },
];

export const galleryItems: GalleryItem[] = [
  { src: "/images/jim-hope-throne.webp", alt: "Santa Jim Hope seated on an ornate holiday throne", caption: "Santa Jim · 2025" },
  { src: "/images/jim-hope-storytime.webp", alt: "Santa Jim Hope reading a Christmas story with a baby", caption: "Storytime visits" },
  { src: "/images/jim-hope-dog.webp", alt: "Santa Jim Hope smiling while holding a small dog", caption: "Pet-friendly moments" },
  { src: "/images/jim-hope-group-2024.webp", alt: "Santa Jim Hope posing with a large group at a 2024 holiday gathering", caption: "Community celebrations" },
  { src: "/images/jim-hope-baby.webp", alt: "Santa Jim Hope holding a baby during a Christmas visit", caption: "Little first Christmases" },
  { src: "/images/jim-hope-inclusive-visit.webp", alt: "Santa Jim Hope visiting with a child using a wheelchair", caption: "Welcoming visits" },
  { src: "/images/jim-hope-community.webp", alt: "Santa Jim Hope posing with two guests at a holiday event", caption: "Festive gatherings" },
  { src: "/images/jim-hope-hug.webp", alt: "A guest giving Santa Jim Hope a joyful hug", caption: "Joyful moments" },
  { src: "/images/jim-hope-guest.webp", alt: "Santa Jim Hope seated beside a guest for a holiday portrait", caption: "Portrait moments" },
  { src: "/images/jim-hope-elf.webp", alt: "Santa Jim Hope seated with a young visitor dressed as an elf", caption: "Christmas wonder" },
];

export const sampleTestimonials: SampleTestimonial[] = [
  { quote: "This sample shows where a short family review will appear once the client provides an approved testimonial.", attribution: "Sample testimonial layout" },
  { quote: "This sample demonstrates how an event organizer's feedback will be presented without inventing a customer claim.", attribution: "Sample testimonial layout" },
];

export const faqs: FaqItem[] = [
  { question: "How early should I inquire?", answer: "Holiday dates can be limited. Send your preferred date and time, and availability will be confirmed directly." },
  { question: "Can the visit be personalized?", answer: "Use the inquiry notes to describe your celebration. Personalization options will be confirmed before booking." },
  { question: "What kinds of events can I ask about?", answer: "You may inquire about home visits, birthdays, schools, organizations, business events, community celebrations, and photo sessions." },
  { question: "Where does Santa travel?", answer: "The final service area will be added after the client confirms travel boundaries. Include your event location in the inquiry." },
];
