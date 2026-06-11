import { StudentProfile } from "../types";

export const TOPICS_RECORDS = {
  fractions: { 
    id: "fractions",
    name: "Fractions", 
    category: "Arithmetic Foundation",
    info: "Grasping division ratios, reciprocal structures, and parts-of-a-whole partitioning.",
    academicLevel: "Grade 5-6"
  },
  decimals: { 
    id: "decimals",
    name: "Decimals", 
    category: "Numerical Science",
    info: "Mapping fractional ratios to system-10 positional columns and relative magnitude scaling.",
    academicLevel: "Grade 6"
  },
  geometry: { 
    id: "geometry",
    name: "Geometry", 
    category: "Spatial Measurement",
    info: "Two-dimensional flat shapes, boundary perimeters, and modular surface volume sizing.",
    academicLevel: "Grade 6-7"
  },
  linear_equations: { 
    id: "linear_equations",
    name: "Linear Equations", 
    category: "Algebra Core",
    info: "Unwrapping single-variable linear balance scaling by executing symmetrical mirror operations.",
    academicLevel: "Grade 7-8"
  },
  word_problems: { 
    id: "word_problems",
    name: "Word Problems", 
    category: "Verbal Translation",
    info: "Deconstructing narrative paragraphs into formal symbolic mathematical formulations.",
    academicLevel: "Grade 8"
  }
};

export const PATHS = [
  { from: "fractions", to: "decimals" },
  { from: "fractions", to: "geometry" },
  { from: "fractions", to: "linear_equations" },
  { from: "decimals", to: "linear_equations" },
  { from: "linear_equations", to: "word_problems" }
];

export const INITIAL_LEITNER_DECK = [
  { 
    id: "f1", 
    front: "What does the numerator (top number) of a fraction represent?", 
    back: "The count of partitioned parts of the whole that you currently possess or are measuring.", 
    deck: 1, 
    topic: "fractions" 
  },
  { 
    id: "f2", 
    front: "What does equivalent fraction mean?", 
    back: "Fractions that express the exact same proportional size or value even with different numbers (e.g. 1/2 = 2/4).", 
    deck: 1, 
    topic: "fractions" 
  },
  { 
    id: "f3", 
    front: "Why do we flip the reciprocal when dividing fractions?", 
    back: "Because division by a ratio is the inverse operation, identical to scaling by the inverted sizes.", 
    deck: 2, 
    topic: "fractions" 
  },
  { 
    id: "d1", 
    front: "Why is 0.45 smaller than 0.8?", 
    back: "Because 0.8 contains 8 tenths (80 hundredths), while 0.45 contains only 4 tenths and 5 hundredths.", 
    deck: 1, 
    topic: "decimals" 
  },
  { 
    id: "l1", 
    front: "What is the primary balance rule in linear algebra?", 
    back: "Whatever action you execute on one side of the equation MUST be instantly repeated on the opposing side to maintain equilibrium.", 
    deck: 1, 
    topic: "linear_equations" 
  },
  {
    id: "w1",
    front: "In a math text story, what punctuation or word represents standard equality (=)?",
    back: "Transactional verbs like 'is', 'equals', 'yields', or 'results in' translate directly to the equality mark.",
    deck: 1,
    topic: "word_problems"
  }
];

export const CONCEPT_GUIDES = {
  fractions: {
    summary: "Visual partition mapping: fractions model partition sizes. Low mastery directly blocks decimals, ratios, and rates.",
    tips: [
      "Keep slice proportions identical when comparing ratios.",
      "Use spatial grid graphs to represent dividing steps.",
      "Avoid adding denominators directly — keep sizing terms static."
    ],
    commonMistake: "Folk-comparison trap: treating denominator and numerator as independent numbers (e.g. thinking 1/8 is larger than 1/4 because 8 is larger than 4)."
  },
  decimals: {
    summary: "Place-value column intervals: maps numeric proportions to positional spaces. Correlates to units, currencies, and scale factors.",
    tips: [
      "Attach fractions as matching decimals (e.g., 0.2 is exactly 2 tenths).",
      "Pad decimals with trailing zeroes to check sizes (e.g., align 0.8 as 0.80).",
      "Keep decimal points strictly columned."
    ],
    commonMistake: "Long-number trap: reading decimals as raw integers separated by a dot (e.g. 0.35 > 0.7 because 35 is larger than 7)."
  },
  geometry: {
    summary: "Dimensions and spacing ratios. Connects basic multiplications to visual spaces and cuts segments.",
    tips: [
      "Understand area as the sum of tiny unit squares packed internally.",
      "Track dimensions carefully when scaling shapes up or down.",
      "Link circle fractions back to partitioning slices."
    ],
    commonMistake: "Boundary overlap: swapping the outer perimeter (the fence) for the inner area (the grass area itself)."
  },
  linear_equations: {
    summary: "Scaling, unknowns, and balancing. Unwrapping numeric packages by applying reciprocal inverses on both sides of the balance.",
    tips: [
      "Always unwrap standard operations in reverse PEMDAS sequence.",
      "Visualize equation sides as identical mass pans resting on a scale.",
      "Execute equations step-by-step to prevent sign transcription slips."
    ],
    commonMistake: "Unchecked transcription: swapping or ignoring inverse operations when shifting numbers across the equals (=) scale line."
  },
  word_problems: {
    summary: "Translating narrative patterns to algebraic models. Demands translating complex verbal syntax into clean, compute-ready symbolic structures.",
    tips: [
      "Break text into separate nouns and assign algebraic letters.",
      "Create immediate sketches or physical layouts to represent narrative motion.",
      "Verify that your final computed variable makes human grammatical sense."
    ],
    commonMistake: "Premature calculation: computing random additions/multiplications before completing the formal algebraic equation first."
  }
};

export const PRESET_PROFILES: Record<string, StudentProfile> = {
  demo_student: {
    student_id: "demo_student",
    updated_at: "22026-06-10",
    topics: {
      fractions: { mastery: 0.40, attempts: 2, last_seen: "2026-06-08", decayRate: 0.12, daysSinceSeen: 2 },
      decimals: { mastery: 0.80, attempts: 1, last_seen: "2026-06-08", decayRate: 0.05, daysSinceSeen: 2 },
      linear_equations: { mastery: 0.20, attempts: 1, last_seen: "2026-06-08", decayRate: 0.18, daysSinceSeen: 2 },
      geometry: { mastery: 0.00, attempts: 0, last_seen: "Never", decayRate: 0.10, daysSinceSeen: 99 },
      word_problems: { mastery: 0.00, attempts: 0, last_seen: "Never", decayRate: 0.22, daysSinceSeen: 99 }
    },
    weaknesses: ["linear_equations", "fractions"],
    cognitive: {
      pace: "steady",
      learningStyle: {
        perception: "sensing",
        input: "visual",
        processing: "reflective",
        understanding: "sequential"
      },
      predictedMilestone: "Decimals-to-Equations transition unlocked",
      readinessScore: 48,
      stallingRisk: "moderate"
    }
  },
  underprepared: {
    student_id: "struggling_learner",
    updated_at: "2026-06-10",
    topics: {
      fractions: { mastery: 0.25, attempts: 4, last_seen: "2026-06-09", decayRate: 0.25, daysSinceSeen: 1 },
      decimals: { mastery: 0.30, attempts: 2, last_seen: "2026-06-09", decayRate: 0.22, daysSinceSeen: 1 },
      linear_equations: { mastery: 0.10, attempts: 1, last_seen: "2026-06-09", decayRate: 0.28, daysSinceSeen: 1 },
      geometry: { mastery: 0.10, attempts: 0, last_seen: "Never", decayRate: 0.18, daysSinceSeen: 99 },
      word_problems: { mastery: 0.00, attempts: 0, last_seen: "Never", decayRate: 0.30, daysSinceSeen: 99 }
    },
    weaknesses: ["fractions", "decimals", "linear_equations"],
    cognitive: {
      pace: "struggling",
      learningStyle: {
        perception: "sensing",
        input: "visual",
        processing: "active",
        understanding: "global"
      },
      predictedMilestone: "Socratic Fractions foundation module rebuild",
      readinessScore: 22,
      stallingRisk: "high"
    }
  },
  transitioning: {
    student_id: "improving_mind",
    updated_at: "2026-06-10",
    topics: {
      fractions: { mastery: 0.85, attempts: 3, last_seen: "2026-06-10", decayRate: 0.04, daysSinceSeen: 0 },
      decimals: { mastery: 0.45, attempts: 2, last_seen: "2026-06-09", decayRate: 0.12, daysSinceSeen: 1 },
      linear_equations: { mastery: 0.35, attempts: 1, last_seen: "2026-06-08", decayRate: 0.15, daysSinceSeen: 2 },
      geometry: { mastery: 0.60, attempts: 1, last_seen: "2026-06-09", decayRate: 0.08, daysSinceSeen: 1 },
      word_problems: { mastery: 0.10, attempts: 0, last_seen: "Never", decayRate: 0.20, daysSinceSeen: 99 }
    },
    weaknesses: ["decimals", "linear_equations"],
    cognitive: {
      pace: "intermittent",
      learningStyle: {
        perception: "intuitive",
        input: "verbal",
        processing: "active",
        understanding: "sequential"
      },
      predictedMilestone: "Linear Equation solving mastery by end of week",
      readinessScore: 61,
      stallingRisk: "low"
    }
  },
  advanced_learner: {
    student_id: "stellar_mathlete",
    updated_at: "2026-06-10",
    topics: {
      fractions: { mastery: 0.95, attempts: 6, last_seen: "2026-06-10", decayRate: 0.01, daysSinceSeen: 0 },
      decimals: { mastery: 0.92, attempts: 4, last_seen: "2026-06-10", decayRate: 0.02, daysSinceSeen: 0 },
      linear_equations: { mastery: 0.88, attempts: 3, last_seen: "2026-06-09", decayRate: 0.03, daysSinceSeen: 1 },
      geometry: { mastery: 0.85, attempts: 2, last_seen: "2026-06-08", decayRate: 0.04, daysSinceSeen: 2 },
      word_problems: { mastery: 0.40, attempts: 2, last_seen: "2026-06-09", decayRate: 0.10, daysSinceSeen: 1 }
    },
    weaknesses: ["word_problems"],
    cognitive: {
      pace: "accelerated",
      learningStyle: {
        perception: "intuitive",
        input: "verbal",
        processing: "reflective",
        understanding: "global"
      },
      predictedMilestone: "Entering full high-school algebraic formulation sets",
      readinessScore: 94,
      stallingRisk: "low"
    }
  }
};
