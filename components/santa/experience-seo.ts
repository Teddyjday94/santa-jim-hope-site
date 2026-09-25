export type ExperienceDetail = {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  detailHeading: string;
  detailIntro: string;
  planningTips: string[];
  relatedSlugs: string[];
};

export const experienceDetails: ExperienceDetail[] = [
  {
    slug: "home-visits",
    title: "Home visits",
    seoTitle: "Santa Home Visits in Baton Rouge, LA | Santa Jim",
    seoDescription: "Plan a personal Santa home visit in Baton Rouge with Santa Jim, including family traditions, storytime, photos, surprises, and a visit shaped around your gathering.",
    detailHeading: "Santa home visits in Baton Rouge that feel personal from the first hello.",
    detailIntro: "A Santa visit at home can be one of the most personal moments of the season. Santa Jim works from the details you share so the arrival can fit your family, your traditions, the pace of the gathering, and the moments you hope everyone remembers.",
    planningTips: [
      "Share the preferred date, arrival window, and full event location.",
      "Include names, traditions, gifts, stories, or surprises Santa should know about.",
      "Mention children, pets, accessibility needs, or anything that can help the visit feel comfortable.",
    ],
    relatedSlugs: ["photo-sessions", "birthday-surprises"],
  },
  {
    slug: "birthday-surprises",
    title: "Birthday surprises",
    seoTitle: "Santa Birthday Appearances in Baton Rouge, LA | Santa Jim",
    seoDescription: "Ask about a Santa birthday appearance in Baton Rouge for a Christmas-season celebration, with a visit shaped around the guest of honor, family, and party plans.",
    detailHeading: "A Christmas-season birthday can get its own Santa surprise.",
    detailIntro: "When a birthday lands during the Christmas season, Santa can become part of the celebration without taking over the reason everyone gathered. Santa Jim can shape the appearance around the guest of honor, the party schedule, photos, greetings, and any surprise you want to keep under wraps.",
    planningTips: [
      "Tell Santa Jim the birthday guest's name, age, and the tone of the party.",
      "Share where the Santa arrival fits into cake, gifts, photos, or other activities.",
      "Include any surprise details privately in the inquiry notes so the entrance can stay a surprise.",
    ],
    relatedSlugs: ["home-visits", "photo-sessions"],
  },
  {
    slug: "corporate-events",
    title: "Corporate events",
    seoTitle: "Corporate Santa in Baton Rouge, LA | Santa Jim",
    seoDescription: "Book a corporate Santa appearance in Baton Rouge for company parties, customer events, employee celebrations, holiday photos, and seasonal business gatherings.",
    detailHeading: "A polished Santa presence for Baton Rouge company and customer events.",
    detailIntro: "Business holiday events need a Santa who can work with the schedule, the venue, and the mix of guests in the room. Santa Jim can appear for company celebrations, customer events, employee gatherings, photo opportunities, and other seasonal moments planned by your team.",
    planningTips: [
      "Share the venue, expected attendance, parking or loading details, and event contact.",
      "Explain whether Santa will greet guests, pose for photos, visit a stage, or move through the event.",
      "Include the run of show and any hard arrival or departure times that the appearance needs to fit.",
    ],
    relatedSlugs: ["community-celebrations", "photo-sessions"],
  },
  {
    slug: "schools-groups",
    title: "Schools & groups",
    seoTitle: "Santa for Schools & Groups in Baton Rouge, LA | Santa Jim",
    seoDescription: "Invite Santa Jim to a Baton Rouge school, church, youth group, classroom, organization, or group holiday celebration with an age-aware visit planned around your schedule.",
    detailHeading: "Santa visits for Baton Rouge schools, classrooms, churches, and groups.",
    detailIntro: "Group visits work best when Santa understands the ages, setting, timing, and goals before he arrives. Santa Jim can adapt the visit for classrooms, churches, youth groups, organizations, and other gatherings where a warm, organized appearance matters as much as the Christmas magic.",
    planningTips: [
      "Share the group size, age range, location, and the amount of time available for the visit.",
      "Tell Santa Jim whether the plan includes a story, group greeting, individual photos, or a special presentation.",
      "Include accessibility, sensory, check-in, or staff coordination details that can make the visit smoother.",
    ],
    relatedSlugs: ["community-celebrations", "home-visits"],
  },
  {
    slug: "community-celebrations",
    title: "Community celebrations",
    seoTitle: "Santa for Community Events in Baton Rouge, LA | Santa Jim",
    seoDescription: "Invite Santa Jim to a Baton Rouge community Christmas event, festival, market, neighborhood celebration, tree lighting, or seasonal public gathering.",
    detailHeading: "A welcoming Santa presence for Baton Rouge community Christmas events.",
    detailIntro: "Festivals, markets, neighborhood traditions, and public celebrations often ask Santa to connect with many different families in a short window. Santa Jim can work with the event plan so greetings, photos, stage moments, and guest flow feel warm and organized instead of rushed.",
    planningTips: [
      "Share the event schedule, expected crowd size, venue layout, and primary event contact.",
      "Explain whether Santa has a fixed photo area, stage appearance, parade entrance, or roaming role.",
      "Include arrival access, changing space, weather plans, and any announcements or traditions Santa should know about.",
    ],
    relatedSlugs: ["corporate-events", "schools-groups"],
  },
  {
    slug: "photo-sessions",
    title: "Photo sessions",
    seoTitle: "Santa Photo Sessions in Baton Rouge, LA | Santa Jim",
    seoDescription: "Plan Santa photo sessions in Baton Rouge with Santa Jim for photographers, studios, venues, businesses, families, and organized holiday portrait events.",
    detailHeading: "Camera-ready Santa photo sessions for Baton Rouge holiday portraits.",
    detailIntro: "A good Santa photo session is about more than sitting still for the camera. Santa Jim can coordinate with the photographer, studio, venue, or event team so the pacing, guest interaction, posing, and transitions support the kind of holiday portraits you are trying to create.",
    planningTips: [
      "Share the photographer or venue contact, session schedule, and expected number of families or guests.",
      "Explain the set, seating, lighting, and whether Santa needs to arrive camera-ready at a specific time.",
      "Include how guests will rotate through the set and whether the session includes pets, babies, groups, or special accommodations.",
    ],
    relatedSlugs: ["home-visits", "corporate-events"],
  },
];

export function getExperienceBySlug(slug: string) {
  return experienceDetails.find((item) => item.slug === slug);
}
