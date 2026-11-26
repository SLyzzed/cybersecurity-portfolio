export const ludusInfrastructure = {
  id: "ludus",
  title: "Ludus Cyber Range",
  href: "/projects/ludus/"
} as const;

export const researchSections = [
  {
    collection: "infrastructure",
    slug: "infrastructure",
    title: "Infrastructure",
    description: "Lab environments, architecture, baselines, and runbooks that support repeatable research.",
    projects: [ludusInfrastructure]
  },
  {
    collection: "research",
    slug: "security-research",
    title: "Security Research",
    description: "Experiments that explore security behaviour, test hypotheses, and document what the evidence shows.",
    projects: []
  },
  {
    collection: "investigations",
    slug: "incident-investigations",
    title: "Incident Investigations",
    description: "Case write-ups that trace how evidence was collected, interpreted, and used to reach a conclusion.",
    projects: []
  },
  {
    collection: "engineering",
    slug: "security-engineering",
    title: "Security Engineering",
    description: "Tools, detections, and workflows built to solve practical security problems.",
    projects: [
      { title: "API Threat Detector", href: "/projects/api-threat-detector/" },
      { title: "Home Network Guardian", href: "/projects/home-network-guardian/" }
    ]
  },
  {
    collection: "blog",
    slug: "blog",
    title: "Blog",
    description: "Technical reflections and notes from ongoing research.",
    projects: []
  }
] as const;

export type ResearchSection = (typeof researchSections)[number];
