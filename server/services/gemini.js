import Groq from "groq-sdk";

const extractJson = (text) => {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  const objMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objMatch) return JSON.parse(objMatch[0]);

  const arrMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrMatch) return JSON.parse(arrMatch[0]);

  throw new Error("No valid JSON found");
};

const getClient = () => {
  const apiKey = process.env.GROQ_API_KEY;

  console.log("🔑 GROQ KEY LOADED:", apiKey ? "YES ✅" : "NO ❌");

  if (!apiKey) throw new Error("GROQ_API_KEY missing in .env");

  return new Groq({ apiKey });
};

const MODEL = "llama-3.1-8b-instant";

const chat = async (prompt) => {
  const groq = getClient();

  const res = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  return res.choices?.[0]?.message?.content ?? "";
};

// =============================
// Generate Questions
// =============================
export const generateInterviewQuestions = async (role) => {
  try {
    const text = await chat(
      `Generate 5 interview questions for a ${role}.
Respond ONLY as JSON array like ["Q1","Q2"].`
    );

    return extractJson(text);
  } catch (error) {
    console.error("Groq Questions Error:", error.message);
    return ["Fallback Question 1", "Fallback Question 2"];
  }
};

// =============================
// Evaluate Answer
// =============================
export const evaluateAnswer = async (role, question, answer) => {
  try {
    const text = await chat(
      `Evaluate this answer.

Question: ${question}
Answer: ${answer}

Respond ONLY in JSON:
{ "score": 1, "feedback": "text" }`
    );

    return extractJson(text);
  } catch (error) {
    console.error("Groq Eval Error:", error.message);
    return { score: 0, feedback: "AI failed" };
  }
};

// =============================
// Resume Analysis
// =============================
export const analyzeResume = async (resumeText) => {
  try {
    const text = await chat(
      `Analyze this resume and respond ONLY in JSON:
{
  "skills": [],
  "gapAnalysis": ""
}

Resume:
${resumeText}`
    );

    return extractJson(text);
  } catch (error) {
    console.error("Groq Resume Error:", error.message);
    return {
      skills: ["JavaScript"],
      gapAnalysis: "Analysis failed",
    };
  }
};