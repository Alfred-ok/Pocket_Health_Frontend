export type Urgency = "self-care" | "see-doctor" | "urgent" | "emergency";

/** Who a condition applies to. "adult" = 12 years and older, not pregnant (the Adult Unwell checker). */
export type Audience = "adult" | "child" | "pregnancy";

export type PregnancyStatus = "pregnant" | "lactating";

export interface HealthCondition {
  id: string;
  name: string;
  category: string;
  symptoms: string[];
  description: string;
  advice: string;
  urgency: Urgency;
  /** Omitted = applies to everyone. */
  audiences?: Audience[];
  /**
   * Pregnancy/lactation conditions only: which stage(s) they apply to, with an optional week window
   * (weeks pregnant, or weeks since delivery when lactating).
   */
  stages?: { status: PregnancyStatus; minWeeks?: number; maxWeeks?: number }[];
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

/** Extra symptoms offered only in the Child Health (under 12) checker. */
export const CHILD_SYMPTOM_GROUP = {
  label: "Children",
  symptoms: [
    "poor feeding",
    "irritability",
    "ear pain or pulling",
    "barking cough",
    "noisy breathing",
    "unusual drowsiness",
    "fewer wet nappies",
    "seizure (fits)",
    "mouth sores",
    "red eyes",
  ],
};

/** Extra symptoms offered only in the Pregnancy & Lactation checker. */
export const PREGNANCY_SYMPTOM_GROUP = {
  label: "Pregnancy & Breastfeeding",
  symptoms: [
    "vaginal bleeding",
    "heavy vaginal bleeding",
    "abdominal cramping",
    "regular contractions",
    "fluid leaking from vagina",
    "pelvic pressure",
    "reduced baby movements",
    "swelling of face or hands",
    "excessive thirst",
    "shoulder tip pain",
    "breast pain",
    "breast redness or lump",
    "nipple pain",
    "foul-smelling vaginal discharge",
    "low mood",
    "anxiety",
    "trouble sleeping",
    "rapid heartbeat",
  ],
};

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
    audiences: ["adult", "pregnancy"],
  },

  // -- Children (under 12) ----------------------------------------------
  {
    id: "croup",
    name: "Croup",
    category: "Respiratory",
    symptoms: ["barking cough", "noisy breathing", "fever", "runny nose", "irritability"],
    description: "A viral infection that swells the voice box and windpipe, giving a harsh, barking cough - often worse at night.",
    advice: "Keep the child calm and upright and offer fluids. See a doctor promptly. Noisy breathing at rest, struggling to breathe or bluish lips is an emergency.",
    urgency: "see-doctor",
    audiences: ["child"],
  },
  {
    id: "bronchiolitis",
    name: "Bronchiolitis",
    category: "Respiratory",
    symptoms: ["runny nose", "cough", "wheezing", "rapid breathing", "poor feeding", "fever"],
    description: "A viral chest infection of the small airways, most common in babies and toddlers under 2.",
    advice: "See a doctor soon, especially for babies. Seek emergency care if breathing is very fast, the chest pulls in with each breath, or the baby feeds less than half the usual amount.",
    urgency: "urgent",
    audiences: ["child"],
  },
  {
    id: "otitis-media",
    name: "Middle Ear Infection (Otitis Media)",
    category: "Ear, Nose & Throat",
    symptoms: ["ear pain or pulling", "fever", "irritability", "poor feeding", "runny nose"],
    description: "An infection behind the eardrum, common in young children and often following a cold.",
    advice: "See a doctor if it lasts more than 2-3 days, there is discharge from the ear, or the child is under 6 months. Only give pain or fever medicine a clinician has advised for the child's age and weight.",
    urgency: "see-doctor",
    audiences: ["child"],
  },
  {
    id: "hand-foot-mouth",
    name: "Hand, Foot & Mouth Disease",
    category: "Infectious",
    symptoms: ["fever", "mouth sores", "rash", "poor feeding", "irritability"],
    description: "A common, usually mild viral illness with mouth ulcers and spots on the hands and feet.",
    advice: "Offer cool fluids and soft foods and keep the child home while unwell. See a doctor if the child is not drinking or has fewer wet nappies.",
    urgency: "self-care",
    audiences: ["child"],
  },
  {
    id: "measles",
    name: "Measles (Suspected)",
    category: "Infectious",
    symptoms: ["fever", "rash", "cough", "runny nose", "red eyes"],
    description: "A highly contagious viral infection: fever, cough and red eyes followed by a spreading rash.",
    advice: "Call ahead before visiting a clinic so others are not exposed, and check the child's immunisation record. Seek care urgently for breathing difficulty or drowsiness.",
    urgency: "urgent",
    audiences: ["child"],
  },
  {
    id: "child-dehydration",
    name: "Dehydration",
    category: "Digestive",
    symptoms: ["diarrhea", "vomiting", "fewer wet nappies", "unusual drowsiness", "dehydration", "poor feeding"],
    description: "Loss of body fluid, most often from diarrhoea and vomiting - children dehydrate faster than adults.",
    advice: "Give oral rehydration solution in small, frequent sips. Unusual drowsiness, no urine for 8 hours or sunken eyes needs emergency care.",
    urgency: "urgent",
    audiences: ["child"],
  },
  {
    id: "febrile-seizure",
    name: "Febrile Seizure (Fits with Fever)",
    category: "Neurological",
    symptoms: ["seizure (fits)", "fever", "unusual drowsiness"],
    description: "A fit triggered by a high temperature, most common between 6 months and 5 years.",
    advice: "Lay the child on their side, don't put anything in their mouth, and time the fit. Seek emergency care, especially for a first fit or one lasting over 5 minutes.",
    urgency: "emergency",
    audiences: ["child"],
  },

  // -- Pregnancy --------------------------------------------------------
  {
    id: "morning-sickness",
    name: "Morning Sickness",
    category: "Pregnancy",
    symptoms: ["nausea", "vomiting", "fatigue", "loss of appetite"],
    description: "Nausea and vomiting in early pregnancy - very common, and usually easing by 16-20 weeks.",
    advice: "Eat small, frequent meals and sip fluids. Only take anti-sickness medicine prescribed for pregnancy. See a doctor if you can't keep fluids down.",
    urgency: "self-care",
    audiences: ["pregnancy"],
    stages: [{ status: "pregnant", maxWeeks: 20 }],
  },
  {
    id: "hyperemesis",
    name: "Hyperemesis Gravidarum (Severe Pregnancy Sickness)",
    category: "Pregnancy",
    symptoms: ["vomiting", "nausea", "dehydration", "weight loss", "dizziness", "rapid heartbeat"],
    description: "Severe, persistent vomiting in pregnancy that leads to dehydration and weight loss.",
    advice: "Needs prompt medical review - you may need fluids and anti-sickness treatment given at a facility.",
    urgency: "urgent",
    audiences: ["pregnancy"],
    stages: [{ status: "pregnant", maxWeeks: 22 }],
  },
  {
    id: "miscarriage-warning",
    name: "Threatened Miscarriage",
    category: "Pregnancy",
    symptoms: ["vaginal bleeding", "abdominal cramping", "abdominal pain", "heavy vaginal bleeding"],
    description: "Bleeding or cramping in the first 20 weeks of pregnancy. It does not always mean a pregnancy is lost, but it needs checking.",
    advice: "Seek care now. Heavy bleeding, severe pain or feeling faint is an emergency.",
    urgency: "emergency",
    audiences: ["pregnancy"],
    stages: [{ status: "pregnant", maxWeeks: 20 }],
  },
  {
    id: "ectopic-pregnancy",
    name: "Ectopic Pregnancy (Suspected)",
    category: "Pregnancy",
    symptoms: ["abdominal pain", "vaginal bleeding", "shoulder tip pain", "dizziness", "abdominal cramping"],
    description: "A pregnancy growing outside the womb, usually in a fallopian tube - typically found at 4-12 weeks.",
    advice: "This can be life-threatening. Seek emergency care immediately, especially with one-sided pain, shoulder tip pain or fainting.",
    urgency: "emergency",
    audiences: ["pregnancy"],
    stages: [{ status: "pregnant", maxWeeks: 14 }],
  },
  {
    id: "pre-eclampsia",
    name: "Pre-eclampsia (Suspected)",
    category: "Pregnancy",
    symptoms: ["headache", "blurred vision", "swelling of face or hands", "abdominal pain", "shortness of breath", "vomiting"],
    description: "High blood pressure in the second half of pregnancy, or up to 6 weeks after delivery, which can affect mother and baby.",
    advice: "Seek emergency care now. Pre-eclampsia can get worse quickly, and a blood pressure and urine check is needed straight away.",
    urgency: "emergency",
    audiences: ["pregnancy"],
    stages: [
      { status: "pregnant", minWeeks: 20 },
      { status: "lactating", maxWeeks: 6 },
    ],
  },
  {
    id: "preterm-labour",
    name: "Preterm Labour",
    category: "Pregnancy",
    symptoms: ["regular contractions", "fluid leaking from vagina", "pelvic pressure", "abdominal cramping", "vaginal bleeding"],
    description: "Labour starting before 37 weeks of pregnancy.",
    advice: "Go to your maternity unit or emergency care now - early treatment can delay birth and protect the baby.",
    urgency: "emergency",
    audiences: ["pregnancy"],
    stages: [{ status: "pregnant", minWeeks: 20, maxWeeks: 37 }],
  },
  {
    id: "reduced-fetal-movement",
    name: "Reduced Baby Movements",
    category: "Pregnancy",
    symptoms: ["reduced baby movements"],
    description: "A change in, or slowing of, your baby's usual pattern of movements.",
    advice: "Don't wait until the next day - contact your maternity unit or clinic straight away to have your baby checked.",
    urgency: "urgent",
    audiences: ["pregnancy"],
    stages: [{ status: "pregnant", minWeeks: 24 }],
  },
  {
    id: "gestational-diabetes",
    name: "Gestational Diabetes",
    category: "Pregnancy",
    symptoms: ["excessive thirst", "frequent urination", "fatigue", "blurred vision"],
    description: "High blood sugar that develops during pregnancy, usually picked up at 24-28 weeks.",
    advice: "Ask your antenatal clinic for a blood sugar test. It is usually well managed with diet, activity and sometimes medication.",
    urgency: "see-doctor",
    audiences: ["pregnancy"],
    stages: [{ status: "pregnant", minWeeks: 20 }],
  },

  // -- Lactation / after delivery ---------------------------------------
  {
    id: "mastitis",
    name: "Mastitis",
    category: "Breastfeeding",
    symptoms: ["breast pain", "breast redness or lump", "fever", "chills", "body aches", "fatigue"],
    description: "Inflammation of the breast, sometimes with infection, most often in the first weeks of breastfeeding.",
    advice: "Keep breastfeeding or expressing from the affected side and rest. See a doctor if you have a fever or it isn't improving within 24 hours.",
    urgency: "see-doctor",
    audiences: ["pregnancy"],
    stages: [{ status: "lactating" }],
  },
  {
    id: "blocked-duct",
    name: "Blocked Milk Duct",
    category: "Breastfeeding",
    symptoms: ["breast pain", "breast redness or lump"],
    description: "A tender lump in the breast where milk has built up, without feeling unwell.",
    advice: "Feed often, starting on the affected side, and gently massage towards the nipple. See a doctor if a fever develops.",
    urgency: "self-care",
    audiences: ["pregnancy"],
    stages: [{ status: "lactating" }],
  },
  {
    id: "sore-nipples",
    name: "Sore or Cracked Nipples",
    category: "Breastfeeding",
    symptoms: ["nipple pain", "breast pain"],
    description: "Usually caused by the baby's latch, and common in the early days of breastfeeding.",
    advice: "A lactation consultant, nurse or midwife can help check the latch and positioning.",
    urgency: "self-care",
    audiences: ["pregnancy"],
    stages: [{ status: "lactating" }],
  },
  {
    id: "postpartum-haemorrhage",
    name: "Postpartum Haemorrhage (Heavy Bleeding After Birth)",
    category: "After Delivery",
    symptoms: ["heavy vaginal bleeding", "dizziness", "rapid heartbeat", "confusion"],
    description: "Heavy bleeding after childbirth - soaking a pad within an hour or passing large clots.",
    advice: "This is an emergency. Seek emergency care immediately.",
    urgency: "emergency",
    audiences: ["pregnancy"],
    stages: [{ status: "lactating", maxWeeks: 12 }],
  },
  {
    id: "postpartum-infection",
    name: "Postpartum Infection",
    category: "After Delivery",
    symptoms: ["fever", "foul-smelling vaginal discharge", "abdominal pain", "chills", "rapid heartbeat"],
    description: "Infection of the womb or a birth wound in the weeks after delivery.",
    advice: "See a doctor today - this needs treatment chosen to be safe while breastfeeding. Feeling very unwell or confused is an emergency.",
    urgency: "urgent",
    audiences: ["pregnancy"],
    stages: [{ status: "lactating", maxWeeks: 6 }],
  },
  {
    id: "postpartum-depression",
    name: "Postpartum Depression",
    category: "Mental Health",
    symptoms: ["low mood", "anxiety", "trouble sleeping", "fatigue", "loss of appetite"],
    description: "Persistent low mood, anxiety or loss of interest in the year after having a baby - common and treatable.",
    advice: "Talk to your doctor, midwife or a mental health provider. If you have thoughts of harming yourself or your baby, seek emergency help now.",
    urgency: "see-doctor",
    audiences: ["pregnancy"],
    stages: [{ status: "lactating", maxWeeks: 52 }],
  },
];
