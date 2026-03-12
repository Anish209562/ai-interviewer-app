import Groq from "groq-sdk";
import { getGroqApiKey } from "../utils/env.js";

const createAiError = (message) => {
  const error = new Error(message);
  error.statusCode = 502;
  return error;
};

const FALLBACK_AGENT_REPLY =
  "I’m having trouble reaching the AI assistant right now. Please try again in a moment.";

const extractJson = (text) => {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) return JSON.parse(objMatch[0]);

  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrMatch) return JSON.parse(arrMatch[0]);

  throw new Error("No valid JSON found");
};

const getClient = () => {
  const apiKey = getGroqApiKey();

  console.log("🔑 GROQ KEY LOADED:", apiKey ? "YES ✅" : "NO ❌");

  return new Groq({ apiKey });
};

const MODEL = "llama-3.1-8b-instant";

const normalizeContent = (content) => {
  if (typeof content === "string") return content.trim();

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item?.type === "text") return item.text || "";
        return "";
      })
      .join("")
      .trim();
  }

  return "";
};

const logGroqError = (label, error, extra = {}) => {
  console.error(`[Groq:${label}]`, {
    message: error?.message,
    status: error?.status,
    code: error?.code,
    type: error?.type,
    ...extra,
  });
};

const chat = async ({ messages, label }) => {
  const groq = getClient();

  try {
    const res = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.4,
    });

    const text = normalizeContent(res?.choices?.[0]?.message?.content);
    return text;
  } catch (error) {
    logGroqError(label, error, {
      model: MODEL,
      messageCount: messages?.length || 0,
    });
    throw createAiError("Failed to contact Groq AI service");
  }
};

// =============================
// Generate Questions
// =============================
export const generateInterviewQuestions = async (role) => {
  try {
    const text = await chat({
      label: "questions",
      messages: [
        {
          role: "user",
          content: `Generate 5 interview questions for a ${role}.
Respond ONLY as JSON array like ["Q1","Q2"].`,
        },
      ],
    });

    return extractJson(text);
  } catch (error) {
    console.error("Groq Questions Error:", error.message);
    throw createAiError("Failed to generate interview questions");
  }
};

// =============================
// Evaluate Answer
// =============================
export const evaluateAnswer = async (role, question, answer) => {
  try {
    const text = await chat({
      label: "evaluation",
      messages: [
        {
          role: "user",
          content: `Evaluate this answer.

Question: ${question}
Answer: ${answer}

Respond ONLY in JSON:
{ "score": 1, "feedback": "text" }`,
        },
      ],
    });

    return extractJson(text);
  } catch (error) {
    console.error("Groq Eval Error:", error.message);
    throw createAiError("Failed to evaluate answer");
  }
};

// =============================
// Resume Analysis
// =============================
export const analyzeResume = async (resumeText) => {
  try {
    const text = await chat({
      label: "resume",
      messages: [
        {
          role: "user",
          content: `Analyze this resume and respond ONLY in JSON:
{
  "skills": [],
  "gapAnalysis": ""
}

Resume:
${resumeText}`,
        },
      ],
    });

    return extractJson(text);
  } catch (error) {
    console.error("Groq Resume Error:", error.message);
    throw createAiError("Failed to analyze resume");
  }
};

const formatChatHistory = (messages = []) =>
  messages
    .slice(-8)
    .map((entry) => `${entry.role === 'assistant' ? 'Assistant' : 'User'}: ${entry.content}`)
    .join('\n');

export const generateAgentReply = async ({ message, metadata = {}, previousMessages = [] }) => {
  try {
    const history = formatChatHistory(previousMessages);
    const systemPrompt = `You are Career AI Assistant, an in-app interview coach for software candidates.

Your job:
- help with interview preparation
- improve answers concisely
- give resume suggestions
- support HR and technical interview prep
- explain projects and tell-me-about-yourself responses
- provide role-specific guidance for frontend, backend, full stack, data analyst, and related software roles

Rules:
- be concise, practical, and relevant
- keep responses in clean plain text
- prefer short bullets only when they improve clarity
- avoid unsafe, illegal, or irrelevant advice
- if a request is outside career/interview context, redirect helpfully toward career preparation`;

    const userPrompt = `User context:
- selected role: ${metadata.role || "not provided"}
- tech stack: ${metadata.techStack || "not provided"}
- experience level: ${metadata.experienceLevel || "not provided"}
- quick action: ${metadata.quickAction || "not provided"}

Recent chat:
${history || "No prior messages."}

Current user message:
${message}`;

    const text = await chat({
      label: "agent",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    if (!text) {
      console.error("[Groq:agent] Empty text response", {
        model: MODEL,
        quickAction: metadata.quickAction || "",
      });
      return FALLBACK_AGENT_REPLY;
    }

    return text;
  } catch (error) {
    logGroqError("agent", error, {
      quickAction: metadata.quickAction || "",
      hasHistory: previousMessages.length > 0,
    });
    return FALLBACK_AGENT_REPLY;
  }
};
