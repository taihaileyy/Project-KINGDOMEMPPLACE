// Public facts about KEP, from the intake form Mr. Morgan submitted and KEP's
// own flyers. Everything shown on the public site comes from here until the
// matching database modules (events, programs) replace it.

export const org = {
  name: "Kingdom Empowerment Place",
  short: "KEP",
  tagline: "Empowering youth. Building futures. Changing communities.",
  pastors: "Dr. Lawrence & Lady Kennetta Morgan",
  phone: "(225) 413-9854",
  phoneHref: "tel:+12254139854",
  email: "kingdomempowermentplace@gmail.com",
  address: { line1: "2236 N. Foster Dr.", city: "Baton Rouge", state: "LA", zip: "70806" },
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=2236+N+Foster+Dr+Baton+Rouge+LA+70806",
  // An empty href hides that icon until KEP's link is known.
  social: [
    { label: "Facebook", icon: "facebook", href: "https://www.facebook.com/LawrenceRMorganSr" },
    { label: "Instagram", icon: "instagram", href: "https://www.instagram.com/lyricalapostle" },
    { label: "YouTube", icon: "youtube", href: "https://www.youtube.com/@drlawrencemorgan" },
  ],
} as const;

export const siteNav = [
  { href: "/about", label: "About" },
  { href: "/church", label: "Church" },
  { href: "/programs", label: "Programs" },
  { href: "/housing", label: "Sober Living" },
  { href: "/events", label: "Events" },
  { href: "/studio/book", label: "Book the Studio" },
  { href: "/give", label: "Give" },
];

// Linked from the footer and pages rather than the main nav, to keep it short.
export const moreNav = [{ href: "/gallery", label: "Gallery" }, { href: "/privacy", label: "Privacy" }];

export const fullAddress = `${org.address.line1}, ${org.address.city}, ${org.address.state} ${org.address.zip}`;

export const weekly = [
  { day: "Sunday", time: "10:00 AM", title: "Sunday Worship", detail: "Worship, the Word and fellowship with the KEP church family." },
  { day: "Wednesday", time: "6:30 PM", title: "Bible Study", detail: "A midweek Bible study taught by a Kingdom minister." },
] as const;

export type Img = { src: string; width: number; height: number; alt: string };

export const images = {
  logo: { src: "/images/kep-logo.webp", width: 1600, height: 820, alt: "Kingdom Empowerment Place logo: the letters KEP with a white dove" },
  logoTile: { src: "/images/kep-logo-tile.webp", width: 320, height: 133, alt: "" },
  // The full logo (crown, dove and KEP) on a transparent background.
  logoFull: { src: "/images/kep-logo-full.webp", width: 1600, height: 567, alt: "Kingdom Empowerment Place" },
  heroPoster: { src: "/images/hero-poster.webp", width: 1280, height: 720, alt: "The KEP logo glowing blue, with a white dove" },
  adultMinistry: { src: "/images/adult-ministry.webp", width: 1280, height: 714, alt: "Members of the KEP adult ministry together after a One Body gathering" },
  youthGroup2: { src: "/images/youth-group-2.webp", width: 1320, height: 989, alt: "KEP youth ministry group photo" },
  youthSession: { src: "/images/youth-session.webp", width: 1320, height: 1762, alt: "Young people meeting together at KEP" },
  youthActivity: { src: "/images/youth-activity.webp", width: 1320, height: 1695, alt: "Youth taking part in an activity at KEP" },
  pastors2: { src: "/images/pastors-morgan-2.webp", width: 1200, height: 1943, alt: "Dr. Lawrence and Lady Kennetta Morgan" },
  youthGroup: { src: "/images/youth-group.webp", width: 1320, height: 1751, alt: "Young people from the KEP youth program gathered together" },
  youthMentor: { src: "/images/youth-with-mentor.webp", width: 1320, height: 1759, alt: "KEP youth standing with a mentor" },
  computerLab: { src: "/images/computer-lab.webp", width: 1320, height: 1756, alt: "Students working at computers in the KEP computer lab" },
  computerLab2: { src: "/images/computer-lab-2.webp", width: 1320, height: 1791, alt: "A young person using a computer in the KEP lab" },
  workshop: { src: "/images/workshop.webp", width: 1600, height: 2133, alt: "Adults taking part in a KEP workshop" },
  facility: { src: "/images/facility.webp", width: 1320, height: 1253, alt: "Rooms inside KEP: the studio, computer lab and meeting spaces" },
  pastors: { src: "/images/pastors-morgan.webp", width: 1400, height: 1867, alt: "Dr. Lawrence Morgan and Lady Kennetta Morgan" },
  drMorgan: { src: "/images/dr-lawrence-morgan.webp", width: 1200, height: 1600, alt: "Dr. Lawrence Morgan" },
  celebration: { src: "/images/celebration.webp", width: 1320, height: 1746, alt: "Young people dressed up for a KEP celebration" },
  celebration2: { src: "/images/celebration-2.webp", width: 1320, height: 702, alt: "Families at a KEP celebration" },
  preaching: { src: "/images/preaching.webp", width: 1066, height: 623, alt: "A minister preaching at KEP" },
} satisfies Record<string, Img>;

// Gallery order: community first, then youth, spaces and leadership.
export const gallery: Img[] = [
  images.adultMinistry,
  images.youthGroup2,
  images.youthMentor,
  images.youthSession,
  images.youthActivity,
  images.youthGroup,
  images.computerLab,
  images.computerLab2,
  images.workshop,
  images.facility,
  images.celebration,
  images.celebration2,
  images.pastors,
  images.pastors2,
  images.drMorgan,
  images.preaching,
];

export type Program = {
  slug: string;
  name: string;
  summary: string;
  body: string[];
  highlights: string[];
  image: Img;
};

// Starting programs. Admins will manage these from the dashboard once the
// programs module is live; this list only seeds the public pages until then.
export const programs: Program[] = [
  {
    slug: "youth-mentorship",
    name: "Youth Mentorship",
    summary: "A safe place, positive mentors and real opportunities for young people.",
    body: [
      "Our youth program gives young people a safe place to grow, with mentors who show up for them week after week.",
      "Youth and young adults work toward certifications in different programs, take part in field trips and community activities, and build skills that last.",
    ],
    highlights: ["Leadership development", "Academic support", "Recreation and fun activities", "Mentorship and life skills", "Field trips and certifications"],
    image: images.youthMentor,
  },
  {
    slug: "arts",
    name: "Arts Program",
    summary: "Space for young people and adults to develop their creative gifts.",
    body: ["The Arts Program gives people of every age room to create, perform and develop the gifts God has given them."],
    highlights: ["Creative expression", "Performance opportunities", "Open to all ages"],
    image: images.celebration,
  },
  {
    slug: "entrepreneurship",
    name: "Entrepreneurship Program",
    summary: "Workshops and guidance for people building a business or a new income.",
    body: ["Through workshops and one-on-one guidance, the Entrepreneurship Program helps people turn ideas into real businesses and steady income."],
    highlights: ["Business workshops", "Guidance from people who've done it", "Connections in the community"],
    image: images.workshop,
  },
  {
    slug: "media",
    name: "Media Program",
    summary: "Learn to create in KEP's own studio, from recording to video.",
    body: [
      "The Media Program teaches people to tell stories and share their voice using KEP's studio.",
      "Participants take part in studio contests with prizes and build a portfolio of their own work.",
    ],
    highlights: ["Hands-on studio time", "Contests with prizes", "Build a portfolio"],
    image: images.facility,
  },
  {
    slug: "computer-lab",
    name: "Computer Lab",
    summary: "Computers, internet and help for school, job searches and new skills.",
    body: ["The KEP Computer Lab is open to the community for homework, job applications, learning new digital skills and more."],
    highlights: ["Computers and internet access", "Homework and job search help", "Digital skills"],
    image: images.computerLab,
  },
];

export const housing = {
  name: "Sober Living Program",
  deposit: 100,
  weekly: 150,
  steps: [
    { title: "Reach out", detail: "Call or email us to ask about openings and whether the Sober Living Program is a fit." },
    { title: "Apply", detail: "Create a KEP account and complete a short application for the Sober Living Program." },
    { title: "Review", detail: "Our housing team reviews your application and follows up with you." },
    { title: "Move in", detail: `Pay the $100 deposit and move in. Your first $150 weekly payment is due 7 days later.` },
  ],
};

export type PastEvent = { title: string; when: string; image: Img };

export const recentEvents: PastEvent[] = [
  { title: "The Gathering", when: "July 18, 2026", image: { src: "/images/flyer-the-gathering.webp", width: 1100, height: 1657, alt: "Flyer for The Gathering, a free concert event" } },
  { title: "Stop the Violence March", when: "August 29", image: { src: "/images/flyer-violence-march.webp", width: 1100, height: 1633, alt: "Flyer for the Violence and Killing March to stop the violence" } },
  { title: "KEP Summer Program", when: "Summer", image: { src: "/images/flyer-summer-program.webp", width: 1100, height: 1621, alt: "Flyer for the KEP youth summer program, 4:30 to 7:00 PM" } },
  { title: "Sound the Alarm Conference", when: "April 27, 2024", image: { src: "/images/flyer-sound-the-alarm.webp", width: 1100, height: 1375, alt: "Flyer for Sound the Alarm, a conference for men and women" } },
];

// Giving funds. The slugs match public.funds in the database.
export const funds = [
  { slug: "tithe", name: "Tithe", detail: "Returning a tenth as an act of worship." },
  { slug: "offering", name: "Offering", detail: "Gifts beyond the tithe for the work of the church." },
  { slug: "special", name: "Special giving", detail: "Support for a specific need, event or program." },
  { slug: "other", name: "Other", detail: "Anything else you'd like to give toward." },
] as const;
