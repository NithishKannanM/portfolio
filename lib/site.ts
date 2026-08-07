export const site = {
  name: "Nithish Kannan M",
  shortName: "NKM",
  url: "https://nithishkannanm.com",
  role: "AI Systems Engineer",
  tagline: "Memory, retrieval, and knowing when to stop.",
  description:
    "AI systems engineer working on memory, retrieval, and agent reliability — hybrid-retrieval RAG, predictive memory orchestration, and semantic circuit breakers.",
  location: "Chennai, Tamil Nadu, India",
  email: "nithishkannanm1@gmail.com",
  resume: "/Nithish_Kannan_M_Resume.pdf",
  socials: {
    github: "https://github.com/NithishKannanM",
    linkedin: "https://linkedin.com/in/nithish-kannan-m",
  },
  nav: [
    { label: "Work", href: "/work" },
    { label: "Writing", href: "/blog" },
    { label: "Lab", href: "/lab" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

/**
 * EmailJS credentials deliberately do not live here. They are read from the
 * environment inside app/api/contact/route.ts and never reach the client —
 * see the note there for why.
 */
