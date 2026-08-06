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
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

/**
 * EmailJS. The public key is designed to be public; service and template
 * ids move to env so they aren't hardcoded in source the way they were in
 * the previous site.
 */
export const emailjs = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "",
} as const;
