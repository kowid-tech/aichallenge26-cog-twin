export interface TopicMastery {
  mastery: number;
  attempts: number;
  last_seen: string;
  decayRate: number; // rate of forgetting
  daysSinceSeen: number;
}

export interface CognitiveProfile {
  pace: 'accelerated' | 'steady' | 'struggling' | 'intermittent';
  learningStyle: {
    perception: 'sensing' | 'intuitive'; // factual/visual vs conceptual
    input: 'visual' | 'verbal';
    processing: 'active' | 'reflective';
    understanding: 'sequential' | 'global';
  };
  predictedMilestone: string;
  readinessScore: number; // 0 to 100
  stallingRisk: 'low' | 'moderate' | 'high';
}

export interface StudentProfile {
  student_id: string;
  updated_at: string;
  topics: Record<string, TopicMastery>;
  weaknesses: string[];
  cognitive: CognitiveProfile;
}

export interface PrerequisiteMap {
  topic: string;
  prerequisites: string[];
}

export interface AdvisorRecommendation {
  study_next: string;
  reason: string;
  encouragement: string;
}

export interface Message {
  sender: 'student' | 'twin' | 'retention_agent' | 'transfer_agent' | 'accessibility_agent';
  text: string;
  timestamp: string;
}

