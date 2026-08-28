export type Urgency = "self-care" | "see-doctor" | "urgent" | "emergency";

export interface HealthCondition {
  id: string;
  name: string;
  category: string;
  symptoms: string[];
  description: string;
  advice: string;
  urgency: Urgency;
}

export const URGENCY_LABELS: Record<Urgency, string> = {
  "self-care": "Self-care at home",
  "see-doctor": "See a doctor",
  urgent: "Seek care soon",
  emergency: "Seek emergency care",
};

// Canonical symptom vocabulary used to build the multi-select checklist.
// Grouped loosely by body system for a friendlier picker UI.
export const SYMPTOM_GROUPS: { label: string; symptoms: string[] }[] = [
  {
    label: "General",
    symptoms: ["fever", "chills", "fatigue", "night sweats", "weight loss", "loss of appetite"],
  },
  {
    label: "Head & Neurological",
    symptoms: ["headache", "dizziness", "confusion", "sensitivity to light", "blurred vision", "stiff neck"],
  },
  {
    label: "Respiratory",
    symptoms: ["cough", "sore throat", "runny nose", "nasal congestion", "sneezing", "shortness of breath", "wheezing", "rapid breathing", "chest pain"],
  },
  {
    label: "Digestive",
    symptoms: ["nausea", "vomiting", "diarrhea", "abdominal pain", "dehydration", "difficulty swallowing"],
  },
  {
    label: "Musculoskeletal",
    symptoms: ["body aches", "muscle pain", "joint pain"],
  },
  {
    label: "Skin & Other",
    symptoms: ["rash", "itching", "swelling", "burning urination", "frequent urination"],
  },
];

export const ALL_SYMPTOMS = SYMPTOM_GROUPS.flatMap((g) => g.symptoms);

export const HEALTH_CONDITIONS: HealthCondition[] = [
  {
    id: "common-cold",
    name: "Common Cold",
    category: "Respiratory",
    symptoms: ["cough", "sore throat", "runny nose", "nasal congestion", "sneezing", "headache", "fatigue"],
    description: "A mild viral infection of the nose and throat, usually clearing up on its own within a week.",
    advice: "Rest, stay hydrated, and use over-the-counter remedies for symptom relief. See a doctor if symptoms last more than 10 days or worsen.",
    urgency: "self-care",
  },
  {
    id: "influenza",
    name: "Influenza (Flu)",
    category: "Respiratory",
    symptoms: ["fever", "chills", "body aches", "fatigue", "cough", "sore throat", "headache"],
    description: "A contagious viral infection that hits harder and faster than a cold, often with whole-body symptoms.",
    advice: "Rest and fluids for mild cases. See a doctor if you're at higher risk (young children, elderly, pregnant, chronic conditions) or symptoms are severe.",
    urgency: "see-doctor",
  },
  {
    id: "pneumonia",
    name: "Pneumonia",
    category: "Respiratory",
    symptoms: ["fever", "cough", "shortness of breath", "chest pain", "rapid breathing", "fatigue", "chills"],
    description: "An infection that inflames the air sacs in one or both lungs, which can fill with fluid.",
    advice: "Needs medical evaluation — often requires antibiotics or further tests. Seek care promptly, especially with breathing difficulty.",
    urgency: "urgent",
  },
  {
    id: "malaria",
    name: "Malaria",
    category: "Infectious",
    symptoms: ["fever", "chills", "headache", "muscle pain", "nausea", "vomiting", "fatigue", "night sweats"],
    description: "A mosquito-borne parasitic infection, common in many parts of Kenya — fevers often come in cycles.",
    advice: "Get a malaria test promptly at a clinic or hospital. Early treatment is important to prevent complications.",
    urgency: "urgent",
  },
  {
    id: "typhoid",
    name: "Typhoid Fever",
    category: "Infectious",
    symptoms: ["fever", "headache", "abdominal pain", "loss of appetite", "fatigue", "rash", "weight loss"],
    description: "A bacterial infection spread through contaminated food or water, causing sustained high fever.",
    advice: "Requires diagnosis and antibiotic treatment from a healthcare provider — don't self-treat with leftover antibiotics.",
    urgency: "urgent",
  },
  {
    id: "gastroenteritis",
    name: "Gastroenteritis (Stomach Flu)",
    category: "Digestive",
    symptoms: ["nausea", "vomiting", "diarrhea", "abdominal pain", "fever", "dehydration"],
    description: "Inflammation of the stomach and intestines, usually from a virus, bacteria, or contaminated food.",
    advice: "Sip fluids/oral rehydration solution frequently. See a doctor if you can't keep fluids down or show signs of dehydration.",
    urgency: "see-doctor",
  },
  {
    id: "uti",
    name: "Urinary Tract Infection (UTI)",
    category: "Genitourinary",
    symptoms: ["burning urination", "frequent urination", "abdominal pain", "fever"],
    description: "A bacterial infection anywhere in the urinary system, most often the bladder.",
    advice: "See a doctor for testing and antibiotics — untreated UTIs can spread to the kidneys.",
    urgency: "see-doctor",
  },
  {
    id: "migraine",
    name: "Migraine",
    category: "Neurological",
    symptoms: ["headache", "sensitivity to light", "nausea", "blurred vision", "dizziness"],
    description: "A recurring, often one-sided, throbbing headache disorder that can come with visual or sensory changes.",
    advice: "Rest in a dark, quiet room; over-the-counter pain relief may help. See a doctor if this is a new or unusually severe headache pattern.",
    urgency: "self-care",
  },
  {
    id: "asthma-attack",
    name: "Asthma Attack",
    category: "Respiratory",
    symptoms: ["shortness of breath", "wheezing", "chest pain", "rapid breathing", "cough"],
    description: "A sudden worsening of asthma symptoms caused by narrowing and swelling of the airways.",
    advice: "Use a rescue inhaler if prescribed. If breathing doesn't improve quickly or lips/fingertips turn blue, this is an emergency.",
    urgency: "emergency",
  },
  {
    id: "allergic-reaction",
    name: "Allergic Reaction",
    category: "Immune",
    symptoms: ["rash", "itching", "swelling", "shortness of breath", "dizziness"],
    description: "The immune system's response to a trigger (food, medication, insect sting, etc.), ranging from mild to severe.",
    advice: "Mild reactions may settle with antihistamines. Swelling of the face/throat or breathing trouble is a medical emergency.",
    urgency: "urgent",
  },
  {
    id: "meningitis",
    name: "Meningitis (Suspected)",
    category: "Neurological",
    symptoms: ["fever", "stiff neck", "headache", "confusion", "sensitivity to light", "rash"],
    description: "Inflammation of the membranes around the brain and spinal cord — can be caused by infection and can progress fast.",
    advice: "This combination of symptoms needs urgent medical attention right away — don't wait it out.",
    urgency: "emergency",
  },
  {
    id: "hypertensive-crisis",
    name: "Hypertensive Crisis",
    category: "Cardiovascular",
    symptoms: ["headache", "chest pain", "shortness of breath", "confusion", "dizziness", "blurred vision"],
    description: "A severe, sudden spike in blood pressure that can damage organs if not treated quickly.",
    advice: "If you have a history of high blood pressure and these symptoms together, seek emergency care immediately.",
    urgency: "emergency",
  },
];
