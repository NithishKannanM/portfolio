/**
 * Structured résumé data. Everything here is taken verbatim from
 * Nithish_Kannan_M_Resume.docx — nothing is inferred or embellished.
 * Update this file when the résumé changes.
 */

export const experience = [
  {
    role: "Deep Learning Engineer",
    org: "AI Club, VIT Chennai",
    period: "Jan 2026 — Present",
    points: [
      "Build and review deep learning systems and research-oriented prototypes as part of the club's core AI engineering team.",
      "Delivered a speaker session on Cursor, an AI coding assistant, as part of an AI Club workshop.",
    ],
  },
  {
    role: "AI/ML Engineer",
    org: "AWS Cloud Club, VIT Chennai",
    period: "Feb 2026 — Present",
    points: [
      "Develop ML and cloud-integrated engineering projects on AWS infrastructure within the AWS Student Builder community.",
    ],
  },
  {
    role: "Freelance Web/Infra Consultant",
    org: "Viha Online",
    period: "Jun 2026 — Present",
    points: [
      "Ran a technical audit of a Shopify store (Liquid theme, GraphQL Admin API, GSC data) that surfaced a 58% checkout abandonment rate and a desktop-vs-mobile organic search gap (position 31.5 vs. 10.8).",
      "Queried store analytics via ShopifyQL and a Supermetrics GSC connector to trace an AOV drop to a single underperforming SKU with a 7–8× landing-page traffic gap.",
      "Built and shipped a custom shop-by-purpose.liquid section, wiring it into the homepage through config/settings_data.json.",
    ],
  },
] as const;

export const education = {
  school: "Vellore Institute of Technology (VIT), Chennai",
  degree: "B.Tech, Computer Science and Engineering",
  period: "2024 — 2028",
  cgpa: "8.34 / 10",
  note: "No standing arrears",
} as const;

export const skillGroups = [
  {
    label: "Languages & Frameworks",
    items: ["Python", "C", "C++", "FastAPI", "LangChain (LCEL)", "PyTorch"],
  },
  {
    label: "ML / Retrieval",
    items: ["FAISS", "BM25", "BGE-M3", "Hybrid Retrieval (RRF Fusion)", "TFLite INT8"],
  },
  {
    label: "Systems & Infra",
    items: [
      "Linux cgroup v2",
      "PSI telemetry",
      "OpenTelemetry",
      "MCP (Model Context Protocol)",
      "AWS",
    ],
  },
  {
    label: "Web & Tools",
    items: ["React", "HTML", "CSS", "JavaScript", "SQL", "Git/GitHub"],
  },
] as const;

export const certifications = [
  {
    title: "Machine Learning Specialization",
    issuer: "Stanford University / DeepLearning.AI",
    detail:
      "Supervised Learning, Advanced Learning Algorithms, Unsupervised Learning & Reinforcement Learning.",
  },
  {
    title: "Generative AI Engineering",
    issuer: "IBM",
    detail:
      "Transformer-based Language Modeling, Fine-Tuning Transformers, Foundational Models for NLP.",
  },
] as const;

export const achievements = [
  {
    title: "3rd Place, BIS National Hackathon 2025",
    detail:
      "Empath, an emotion-aware adaptive learning platform (React, FastAPI, HuggingFace, Supabase).",
  },
  {
    title: "Published adaptive-rag-router on PyPI",
    detail:
      "A pip-installable, embedding-similarity routing layer for RAG pipelines with confidence-based refusal and OpenTelemetry tracing.",
  },
] as const;

/** The through-line the site is built around. */
export const thesis = [
  {
    id: "memory",
    title: "Memory",
    body: "What a system keeps, what it forgets, and what it costs to be wrong about either. Predictive memory orchestration and contradiction-aware stores.",
    projects: ["Ring Zero", "ex_mem"],
  },
  {
    id: "retrieval",
    title: "Retrieval",
    body: "Getting the right context in front of the model, and knowing when you haven't. Hybrid dense-plus-lexical retrieval and confidence-based routing.",
    projects: ["Modular Memory Unit", "adaptive-rag-router"],
  },
  {
    id: "stopping",
    title: "Knowing when to stop",
    body: "Systems that recognise their own failure to progress and halt, rather than burning tokens producing the appearance of work.",
    projects: ["Plateau"],
  },
] as const;
