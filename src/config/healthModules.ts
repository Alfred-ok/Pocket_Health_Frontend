/** Interactive sub-modules rendered by HealthModule.tsx (see its TOOL_COMPONENTS registry). */
export type HealthModuleToolKey =
  | "adult-symptom-checker"
  | "child-symptom-checker"
  | "pregnancy-symptom-checker"
  | "shop-compare"
  | "insurance-documents"
  | "sign-contract";

export interface HealthModuleTool {
  tool: HealthModuleToolKey;
  /** URL key: /health-library/<module>?section=<section> opens this sub-module directly. */
  section: string;
  title: string;
  summary: string;
  /** Position among the module's topics (health_topic.sort_order); on a tie the tool comes first. */
  sortOrder: number;
}

export interface HealthModuleConfig {
  /** Matches health_topic.module_key in the database. */
  key: string;
  label: string;
  path: string;
  description: string;
  /** Interactive sub-modules listed alongside the module's text topics. */
  tools?: HealthModuleTool[];
  /** Notice the user must agree to before the module opens (spec: "Agree" / "Back" prompt). */
  disclaimer?: string[];
}

// Adding a future module later is just: add a config entry here + seed health_topic rows
// with that module_key. No new routes, components, or backend code needed —
// HealthModule.tsx and the /health-library/:moduleKey route already serve any module_key.
export const healthModules: HealthModuleConfig[] = [
  {
    key: "adult_unwell",
    label: "Adult Unwell",
    path: "/health-library/adult_unwell",
    description: "Check symptoms & conditions — for people aged 12 and older who are not pregnant.",
    disclaimer: [
      "This information is to aid in understanding your health and does not constitute specific medical advice. Please consult a doctor or seek care at a health facility if you are currently unwell.",
      "The content in this section refers to persons of 12 years and older who are not pregnant. If younger, refer to the Child Health & Immunisation section. If pregnant, refer to the Pregnancy & Lactation section.",
    ],
    tools: [
      {
        tool: "adult-symptom-checker",
        section: "symptom-checker",
        title: "Check Symptoms & Conditions",
        summary: "Pick your symptoms to see possible conditions.",
        sortOrder: 0,
      },
    ],
  },
  {
    key: "wellness",
    label: "Wellness",
    path: "/health-library/wellness",
    description: "Everyday habits for staying healthy — nutrition, activity, sleep and more.",
  },
  {
    key: "mental_health",
    label: "Mental Health",
    path: "/health-library/mental_health",
    description: "Understanding mental wellbeing, coping strategies, and when to seek help.",
  },
  {
    key: "first_aid",
    label: "First Aid",
    path: "/health-library/first_aid",
    description: "Simple, practical guidance for common emergencies.",
  },
  {
    key: "child_immunisation",
    label: "Child Health & Immunisation",
    path: "/health-library/child_immunisation",
    description:
      "For children under 12 — check symptoms, immunisation, growth & milestones, nutrition and chronic conditions.",
    disclaimer: [
      "This information is to aid in understanding your child's health and does not constitute medical advice. Please consult a doctor or seek care at a health facility if your child is currently unwell.",
      "The content in this section refers to persons younger than 12 years of age. If older, refer to the Adult Unwell section.",
    ],
    tools: [
      {
        tool: "child-symptom-checker",
        section: "symptom-checker",
        title: "Unwell Child – Check Symptoms & Conditions",
        summary: "Symptom checker for children under 12.",
        sortOrder: 1,
      },
    ],
  },
  {
    key: "pregnancy_lactation",
    label: "Pregnancy & Lactation",
    path: "/health-library/pregnancy_lactation",
    description: "Guidance through the menstrual cycle, pregnancy, breastfeeding and recovery after delivery.",
    disclaimer: [
      "This information is to aid in understanding pregnancy health and does not constitute medical advice. Please consult a doctor or seek care at a health facility if you are currently unwell.",
      "The content in this section refers to persons who are pregnant or breastfeeding. If not, refer to the Adult Unwell or Child Health & Immunisation sections.",
    ],
    tools: [
      {
        tool: "pregnancy-symptom-checker",
        section: "symptom-checker",
        title: "Unwell in Pregnancy/Lactation",
        summary: "Symptom checker for pregnancy and breastfeeding.",
        sortOrder: 3,
      },
    ],
  },
  {
    key: "health_insurance_education",
    label: "Health Insurance",
    path: "/health-library/health_insurance_education",
    description: "Shop, compare and get health insurance cover — and understand how it works.",
    tools: [
      {
        tool: "shop-compare",
        section: "shop-compare",
        title: "Shop and Compare Health Insurances",
        summary: "Browse insurers and compare them side by side.",
        sortOrder: 0,
      },
      {
        tool: "insurance-documents",
        section: "insurance-documents",
        title: "Health Insurance Documents",
        summary: "Your policy documents and contracts.",
        sortOrder: 0,
      },
      {
        tool: "sign-contract",
        section: "sign-contract",
        title: "Sign Insurance Contract",
        summary: "How getting cover works.",
        sortOrder: 0,
      },
    ],
  },
];
