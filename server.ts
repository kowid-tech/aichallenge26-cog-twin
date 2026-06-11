import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper function for lazy Gemini initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please configure it in your Settings > Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. RECOMMENDATION ENGINE (Deterministic local rule resolver)
export function getRecommendedTopic(topics: Record<string, { mastery: number; attempts: number; last_seen: string }>) {
  // Prerequisite map definitions
  const prereqs: Record<string, string[]> = {
    decimals: ["fractions"],
    geometry: ["fractions"],
    linear_equations: ["fractions", "decimals"],
    word_problems: ["linear_equations"],
    fractions: []
  };

  // List of all topics
  const allTopics = ["fractions", "decimals", "geometry", "linear_equations", "word_problems"];

  // Find actual weaknesses (defined as mastery < 0.5 or not started)
  // Let's analyze each topic's mastery. If not present in "topics", mastery is implicitly 0.0
  const getMastery = (t: string) => {
    return topics[t]?.mastery ?? 0.0;
  };

  const topicScores = allTopics.map(t => ({
    name: t,
    mastery: getMastery(t),
    hasAttempt: (topics[t]?.attempts ?? 0) > 0
  }));

  // Find weak topics (we prioritize topics the student actually attempted and failed, or the lowest mastered topics)
  // Let's filter topics with mastery < 0.5
  const weakTopics = topicScores.filter(t => t.mastery < 0.5);

  if (weakTopics.length === 0) {
    // If everything is mastered, find the next topic that is not fully 1.0
    const incomplete = topicScores.filter(t => t.mastery < 1.0);
    if (incomplete.length === 0) {
      return {
        study_next: "word_problems",
        reason: "You have achieved full mastery across all available modules! Continue exploring advanced word problems to set new milestones.",
        encouragement: "Magnificent work! You've mastered the entire curriculum!"
      };
    }
    // Prioritize lowest
    incomplete.sort((a, b) => a.mastery - b.mastery);
    const candidate = incomplete[0].name;
    return generateStaticRecommendation(candidate, prereqs, getMastery);
  }

  // We have weak topics. Let's check their prerequisites.
  // We want to recommend the lowest-mastered/weak topic, but first check if it has any weak prerequisites.
  // Order of teaching generally flows: Fractions -> Decimals & Geometry -> Linear Equations -> Word Problems
  // Let's sort the weak topics in order of this pedagogical flow so we evaluate foundational skills first:
  const pedagogicalOrder = ["fractions", "decimals", "geometry", "linear_equations", "word_problems"];
  weakTopics.sort((a, b) => pedagogicalOrder.indexOf(a.name) - pedagogicalOrder.indexOf(b.name));

  // Let's find the first weak topic in pedagogical order that has a weak prerequisite, and recommend that prerequisite.
  for (const wt of weakTopics) {
    const listPrereqs = prereqs[wt.name] || [];
    // Find if there's any weak prerequisite
    const weakPrereq = listPrereqs.find(p => getMastery(p) < 0.5);
    if (weakPrereq) {
      // Found a foundational weak prerequisite! Recommend that one.
      return {
        study_next: weakPrereq,
        reason: `${formatTopicName(weakPrereq)} is the foundation that ${formatTopicName(wt.name)} builds upon. Strengthening this foundational skill first will make mastering ${formatTopicName(wt.name)} much easier and more intuitive.`,
        encouragement: `Let's focus on laying down a solid foundation in ${formatTopicName(weakPrereq)} - you will feel so much more confident!`,
        targetOfWeakness: wt.name
      };
    }
  }

  // If we had weak topics but none of them had weak prerequisites, then the weak topic itself is eligible for immediate study!
  // Pick the pedagogically first weak topic.
  const target = weakTopics[0].name;
  return generateStaticRecommendation(target, prereqs, getMastery);
}

function formatTopicName(t: string): string {
  if (t === "linear_equations") return "Linear Equations";
  if (t === "word_problems") return "Word Problems";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function generateStaticRecommendation(topic: string, prereqs: Record<string, string[]>, getMastery: (t: string) => number) {
  const formatted = formatTopicName(topic);
  if (topic === "fractions") {
    return {
      study_next: "fractions",
      reason: "Fractions is the core foundation for decimals, algebra, and geometry. Gaining mastery in fractions is the single most important step to unlock the rest of high-school mathematics.",
      encouragement: "Every great math journey begins with understanding fractional parts. You can do this!"
    };
  }
  if (topic === "decimals") {
    return {
      study_next: "decimals",
      reason: "Decimals are crucial for representing fractional values in finance and science. Since you understand fractions, transitioning into decimal place values is your optimal next step.",
      encouragement: "You are already super close to fully mastering decimals! Let's get that progress bar to 100%!"
    };
  }
  if (topic === "linear_equations") {
    const fractionsMastery = getMastery("fractions");
    const decimalsMastery = getMastery("decimals");
    let prereqDetails = "";
    if (fractionsMastery >= 0.5 && decimalsMastery >= 0.5) {
      prereqDetails = "Now that you have solid grounding in fractions and decimals, you are fully equipped to tackle algebraic variables.";
    } else {
      prereqDetails = "Working on linear equations will help you bridge basic arithmetic and advanced problem solving.";
    }
    return {
      study_next: "linear_equations",
      reason: `Linear Equations represents your current active frontier. ${prereqDetails}`,
      encouragement: "Unlocking algebraic logic will open a whole new world of mathematical reasoning!"
    };
  }
  if (topic === "word_problems") {
    return {
      study_next: "word_problems",
      reason: "Word Problems build on your linear equation skills, testing your ability to translate human sentences into solvable math equations.",
      encouragement: "You've built the raw numerical muscles - now let's apply them to solve real-world mysteries!"
    };
  }
  return {
    study_next: topic,
    reason: `Let's focus on mastering ${formatted} to build a robust, balanced learning profile.`,
    encouragement: "Step by step, you are unlocking your cognitive academic potential!"
  };
}

// REST API endpoint for recommendation
app.post("/api/recommend", (req, res) => {
  try {
    const { topics } = req.body;
    if (!topics) {
      return res.status(400).json({ error: "Missing topics in request body." });
    }
    const recommendation = getRecommendedTopic(topics);
    res.json(recommendation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// REST API endpoint for Gemini interaction
app.post("/api/twin/chat", async (req, res) => {
  try {
    const { messages, studentProfile, targetTopic, activeAgent } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format." });
    }

    const lastUserMessage = messages[messages.length - 1]?.text || "";
    const agentType = activeAgent || "twin";

    // Lazy load the Gemini client safely
    let ai;
    let geminiErrorMsg = "";
    try {
      ai = getGeminiClient();
    } catch (e: any) {
      geminiErrorMsg = e.message;
    }

    // Offline simulation fallback when API key is missing
    if (!ai) {
      console.warn("Using simulated learning advisor response (No API Key configured).");
      let simulatedReply = "";

      const topicName = formatTopicName(targetTopic || "fractions");

      if (agentType === "retention_agent") {
        if (lastUserMessage.toLowerCase().includes("how") || lastUserMessage.toLowerCase().includes("explain") || lastUserMessage.toLowerCase().includes("retention")) {
          simulatedReply = `🔄 **[Retention Agent] Active Recall Drill**:
To optimize long-term cognitive storage for **${topicName}**, we model a natural decay interval. Let's prevent forgetting!
Key memory cue: active visual representation reduces memory trace decay. 
Can you solve a brief recall exercise right now? Try explaining *why* we divide fractions by multiplying the reciprocal. This simple verbalization boosts retention by 40%!`;
        } else {
          simulatedReply = `🔄 **[Retention Agent] Spaced Repetition Engine online**:
I have reviewed your knowledge graph. **${topicName}** is in your active review zone. Consistent 5-minute daily recall prevents the knowledge decay curve from dropping below your 80% exam readiness threshold. Would you like me to prompt an active recall test card?`;
        }
      } else if (agentType === "transfer_agent") {
        if (lastUserMessage.toLowerCase().includes("how") || lastUserMessage.toLowerCase().includes("explain") || lastUserMessage.toLowerCase().includes("transfer") || lastUserMessage.toLowerCase().includes("apply")) {
          simulatedReply = `🌐 **[Skill Transfer Agent] Cross-Domain Analogy**:
Let's apply **${topicName}** to other regions of your world!
- **Physics Analogy**: Fractions represent ratios like density (mass/volume) or velocity (distance/time). Perfecting standard fractional scaling directly unlocks physical rate equations!
- **Finance Analogy**: Decimals and fractions govern compound interest percentage increments (e.g., a interest rates split of 5.25% is exactly **5 + 1/4** percent).
Understanding this transfer makes future learning intuitive! Ask me how this topic relates to electrical engineering or computer graphics!`;
        } else {
          simulatedReply = `🌐 **[Skill Transfer Agent] Multidisciplinary Linkage**:
My job is to connect **${topicName}** to practical scenarios. Math doesn't exist in a vacuum! For example, isolating variables in linear equations is the exact same process computer game engines use to calculate 3D spatial illumination! Ask me how to map this math concept to music synthesizers or finance.`;
        }
      } else if (agentType === "accessibility_agent") {
        simulatedReply = `⚡ **[Accessibility Agent] Low-Cognitive-Load Breakdown**:
Let's simplify **${topicName}** by stripping visual clutter and focusing on core concepts:
1. **Core Concept**: Keep it simple. Each step is highlighted.
2. **Step-by-step**: Use clear sensory cues rather than heavy formulas.
3. **No stress**: We can repeat this as many times as you need!
*Accessibility adjustments are active (Dylexic-friendly structural breakdown applied. Adjust your font spacing toggles above if needed!).*`;
      } else {
        if (lastUserMessage.toLowerCase().includes("how") || lastUserMessage.toLowerCase().includes("explain")) {
          simulatedReply = `Here is a helpful tip for **${topicName}**: Try breaking numbers down into visual pieces before writing them as formulas. For fractions, imagine a pizza or chocolate bar! For equations, think of a weighing balance where both sides must maintain perfect equilibrium. Would you like a practice challenge?`;
        } else if (lastUserMessage.toLowerCase().includes("quiz") || lastUserMessage.toLowerCase().includes("question") || lastUserMessage.toLowerCase().includes("challenge")) {
          if (targetTopic === "fractions") {
            simulatedReply = `Here is a practice question for you:\n\n**If Sarah ate 1/3 of a pizza and Jordan ate 2/6, did they eat the same amount? Explain your answer.**\n\n*(Hint: Try simplifying Jordan's fraction!)*`;
          } else if (targetTopic === "linear_equations") {
            simulatedReply = `Here is an equation challenge for you:\n\n**Solve for x:  3x + 12 = 27**\n\nShow me your steps and I'll review them!`;
          } else {
            simulatedReply = `Let's try a quick puzzle in **${topicName}**:\n\nIf you have 1.25 units and add another 1/4 of a unit, what is your total represented as a decimal?\n\nTake your time to write down your steps!`;
          }
        } else {
          simulatedReply = `Hello! I am your Cognitive Learning Twin. I see you are currently focusing on **${topicName}** to unlock Decimals and Linear Equations. It's a great step! Ask me any conceptual question, or ask me to "give me a quiz" to test your active recall! (Note: Gemini API key is offline, operating on simulated intelligence).`;
        }
      }

      // Simulate a small network delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 600));
      return res.json({ text: simulatedReply, isSimulated: true, errorInfo: geminiErrorMsg });
    }

    // Call real Gemini API
    let agentInstructions = "";
    if (agentType === "retention_agent") {
      agentInstructions = "You are the specialized Retention Agent. Your focus is to combat knowledge decay. Formulate active recall prompts, Leitner flashcard review suggestions, and diagnostic alerts. Advise the student on spacing out their study turns.";
    } else if (agentType === "transfer_agent") {
      agentInstructions = "You are the specialized Skill Transfer Agent. Your focus is cross-disciplinary analogy. Explain mathematics concepts by mapping them to physical sciences, economics, computer programming, or mechanical layouts. Use vivid real-world systems as analogies.";
    } else if (agentType === "accessibility_agent") {
      agentInstructions = "You are the specialized Accessibility Agent. Explain mathematical concepts using very low-cognitive-load sentence structures, clean bullet lists, and easy-to-read, concrete phrasing. Avoid jargon and dense math notation. Support assistive visual analogies.";
    } else {
      agentInstructions = "You are the central Cognitive Learning Twin Agent. Coordinate the student's study pathways, trace prerequisites, diagnose root-cause conceptual gaps, and provide supportive Socratic guidance.";
    }

    const systemInstruction = `You are an expert, friendly Cognitive Learning Twin educational companion.
Cooperative Agent Role: ${agentInstructions}

The student has the following mastery profiles:
${JSON.stringify(studentProfile, null, 2)}

Active focus topic: "${targetTopic || "fractions"}".
Prerequisite structure: Fractions is foundational. Decimals & Geometry build on Fractions. Linear Equations builds on Fractions & Decimals. Word Problems builds on Linear Equations.

Respond warmly, encouragingly, and guide the student with high-quality teaching strategies (e.g. scaffolding, analogies, Socratic questions). Keep your replies concise (under 4 paragraphs), beautiful, and highlight key concepts in markdown. Do not give away answers instantly - guide the student to discover them. Use bold styling for mathematical formulas.`;

    // Sanitize message sequence to alternate 'user' and 'model' roles and start with 'user'
    const contents: any[] = [];
    for (const m of messages) {
      const role = m.sender === 'student' ? 'user' : 'model';
      
      if (contents.length === 0) {
        if (role === 'user') {
          contents.push({ role, parts: [{ text: m.text }] });
        }
        continue; // skip any initial greeting from the model to comply with Gemini structure requirements
      }
      
      const last = contents[contents.length - 1];
      if (last.role === role) {
        last.parts[0].text += "\n" + m.text;
      } else {
        contents.push({ role, parts: [{ text: m.text }] });
      }
    }

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: "Hello!" }] });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      res.json({ text: response.text || "I'm listening! Please tell me more.", isSimulated: false });
    } catch (apiErr: any) {
      console.warn("Real Gemini API request failed, auto-falling back to simulated tutor response:", apiErr);
      
      // Compute the backup simulation response so the user doesn't lose conversation context
      const topicName = formatTopicName(targetTopic || "fractions");
      let simulatedReply = "";

      if (agentType === "retention_agent") {
        if (lastUserMessage.toLowerCase().includes("how") || lastUserMessage.toLowerCase().includes("explain") || lastUserMessage.toLowerCase().includes("retention")) {
          simulatedReply = `🔄 **[Retention Agent] Active Recall Drill**:
To optimize long-term cognitive storage for **${topicName}**, we model a natural decay interval. Let's prevent forgetting!
Key memory cue: active visual representation reduces memory trace decay. 
Can you solve a brief recall exercise right now? Try explaining *why* we divide fractions by multiplying the reciprocal. This simple verbalization boosts retention by 40%!`;
        } else {
          simulatedReply = `🔄 **[Retention Agent] Spaced Repetition Engine online**:
I have reviewed your knowledge graph. **${topicName}** is in your active review zone. Consistent 5-minute daily recall prevents the knowledge decay curve from dropping below your 80% exam readiness threshold. Would you like me to prompt an active recall test card?`;
        }
      } else if (agentType === "transfer_agent") {
        if (lastUserMessage.toLowerCase().includes("how") || lastUserMessage.toLowerCase().includes("explain") || lastUserMessage.toLowerCase().includes("transfer") || lastUserMessage.toLowerCase().includes("apply")) {
          simulatedReply = `🌐 **[Skill Transfer Agent] Cross-Domain Analogy**:
Let's apply **${topicName}** to other regions of your world!
- **Physics Analogy**: Fractions represent ratios like density (mass/volume) or velocity (distance/time). Perfecting standard fractional scaling directly unlocks physical rate equations!
- **Finance Analogy**: Decimals and fractions govern compound interest percentage increments (e.g., a interest rates split of 5.25% is exactly **5 + 1/4** percent).
Understanding this transfer makes future learning intuitive! Ask me how this topic relates to electrical engineering or computer graphics!`;
        } else {
          simulatedReply = `🌐 **[Skill Transfer Agent] Multidisciplinary Linkage**:
My job is to connect **${topicName}** to practical scenarios. Math doesn't exist in a vacuum! For example, isolating variables in linear equations is the exact same process computer game engines use to calculate 3D spatial illumination! Ask me how to map this math concept to music synthesizers or finance.`;
        }
      } else if (agentType === "accessibility_agent") {
        simulatedReply = `⚡ **[Accessibility Agent] Low-Cognitive-Load Breakdown**:
Let's simplify **${topicName}** by stripping visual clutter and focusing on core concepts:
1. **Core Concept**: Keep it simple. Each step is highlighted.
2. **Step-by-step**: Use clear sensory cues rather than heavy formulas.
3. **No stress**: We can repeat this as many times as you need!
*Accessibility adjustments are active (Dylexic-friendly structural breakdown applied. Adjust your font spacing toggles above if needed!).*`;
      } else {
        if (lastUserMessage.toLowerCase().includes("how") || lastUserMessage.toLowerCase().includes("explain")) {
          simulatedReply = `Here is a helpful tip for **${topicName}**: Try breaking numbers down into visual pieces before writing them as formulas. For fractions, imagine a pizza or chocolate bar! For equations, think of a weighing balance where both sides must maintain perfect equilibrium. Would you like a practice challenge?`;
        } else if (lastUserMessage.toLowerCase().includes("quiz") || lastUserMessage.toLowerCase().includes("question") || lastUserMessage.toLowerCase().includes("challenge")) {
          if (targetTopic === "fractions") {
            simulatedReply = `Here is a practice question for you:\n\n**If Sarah ate 1/3 of a pizza and Jordan ate 2/6, did they eat the same amount? Explain your answer.**\n\n*(Hint: Try simplifying Jordan's fraction!)*`;
          } else if (targetTopic === "linear_equations") {
            simulatedReply = `Here is an equation challenge for you:\n\n**Solve for x:  3x + 12 = 27**\n\nShow me your steps and I'll review them!`;
          } else {
            simulatedReply = `Let's try a quick puzzle in **${topicName}**:\n\nIf you have 1.25 units and add another 1/4 of a unit, what is your total represented as a decimal?\n\nTake your time to write down your steps!`;
          }
        } else {
          simulatedReply = `Hello! I am your Cognitive Learning Twin. I see you are currently focusing on **${topicName}** to unlock Decimals and Linear Equations. It's a great step! Ask me any conceptual question, or ask me to "give me a quiz" to test your active recall!`;
        }
      }

      // Return the simulation answer alongside a system diagnostic note
      const fallbackWithDiagnosis = `⚠️ **[Advisor API Warning]** There was an issue reaching the Gemini service (${apiErr.message}).
To preserve your learning session, the built-in Cognitive Advisor is temporarily generating responses locally:

${simulatedReply}`;

      res.json({ text: fallbackWithDiagnosis, isSimulated: true, errorInfo: apiErr.message });
    }
  } catch (err: any) {
    console.error("Fallback route error:", err);
    res.status(500).json({ error: "Advisor Route Fatal Error: " + err.message });
  }
});

// START EXPRESS/VITE ENGINE
async function startServer() {
  // Serve Vite in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
