export const site = {
  brand: "verneytography",
  personalWebsiteUrl: "https://verneylmavt.com/",
  hero: {
    location: "Jakarta, Indonesia",
    coords: "6.2°S 106.8°E",
    name: "Elvern Neylmav Tanny",
    // Stacked display lines for the oversized hero headline.
    nameLines: ["Elvern", "Neylmav", "Tanny"],
    tagline: "Hobbyist Photographer",
    statement: "A hobbyist photographer working in available light.",
    // Decorative camera readouts for the viewfinder-framed tagline.
    viewfinder: { aperture: "f/1.8", shutter: "1/500", iso: "ISO 100" },
  },
  contact: {
    email: "mailto:elvernneylmav@gmail.com",
    linkedin: "https://www.linkedin.com/in/elvern-neylmav-t/",
    instagram: "https://www.instagram.com/verneylmavt/",
    // github: "https://github.com/",
  },
  about: {
    heading: "Photography as a story",
    // TODO: refine — placeholder copy drafted from existing site data.
    body: [
      '"As an AI engineer, I spend my days teaching machines to interpret the world through data and probabilities.',
      "Photography is how I attempt to interpret it myself.",
      "In the streets, stories unfold unscripted, orchestrated only by light, timing, and chance.",
      "A photograph may arrest a single moment in time, but it never confines the story. Every frame bears the imprint of what came before and the possibility of what follows after.",
      'These photographs are fragments of those unseen narratives."',
    ],
    portraitSrc: "/1.jpg", // TODO: replace with a real portrait
    portraitAlt: "Elvern Neylmav Tanny",
  },
  marquee: {
    primary: [
      "verneytography",
      "Hobbyist Photography",
      "Surabaya",
      "Jakarta",
      "Singapore",
      "Est. 2017",
    ],
    divider: ["Selected Work", "Index 01 — 17", "Scroll"],
  },
  info: {
    location: "Jakarta, Indonesia",
    gear: [
      "Sony A7 II",
      "Sony A6400",
      "FE 50mm F1.8",
      "FE 28–70mm F3.5–5.6",
    ],
    body: [
      "Sony A7 II",
      "Sony A6400",
    ],
    lens: [
      "FE 28–70mm F3.5–5.6",
      "FE 50mm F1.8",
      "FE 85mm F1.8",
    ],
    years: "2018 — 2019",
    builtWith: ["Next.js", "TypeScript", "Tailwind CSS", "GSAP", "Motion"],
  },
  statsLabels: {
    photographs: "Photographs",
    subjects: "Subjects",
    years: "Years",
    bodies: "Bodies",
    lenses: "Lenses",
  },
} as const;
