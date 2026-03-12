import AgentChat from '../models/AgentChat.js';
import { generateAgentReply } from '../services/groq.js';

const FALLBACK_AGENT_REPLY =
  'I’m having trouble reaching the AI assistant right now. Please try again in a moment.';

const buildMetadata = (body = {}) => ({
  quickAction: body.quickAction?.trim() || '',
  role: body.role?.trim() || '',
  techStack: body.techStack?.trim() || '',
  experienceLevel: body.experienceLevel?.trim() || '',
});

export const chatWithAgent = async (req, res) => {
  const requestId = `agent_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const message = req.body.message?.trim();
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const metadata = buildMetadata(req.body);
    let previousMessages = [];

    try {
      const existingChat = await AgentChat.findOne({ userId: req.user.id });
      previousMessages = existingChat?.messages ?? [];
    } catch (dbReadError) {
      console.error('[AgentChat] Failed to load history', {
        requestId,
        userId: req.user.id,
        message: dbReadError.message,
      });
    }

    let reply = FALLBACK_AGENT_REPLY;

    try {
      const aiReply = await generateAgentReply({
        message,
        metadata,
        previousMessages,
      });

      if (typeof aiReply === 'string' && aiReply.trim()) {
        reply = aiReply.trim();
      } else {
        console.error('[AgentChat] AI returned empty reply', {
          requestId,
          userId: req.user.id,
        });
      }
    } catch (aiError) {
      console.error('[AgentChat] AI generation failed', {
        requestId,
        userId: req.user.id,
        message: aiError.message,
        statusCode: aiError.statusCode,
      });
    }

    const responseMessages = [
      ...previousMessages,
      { role: 'user', content: message, metadata },
      { role: 'assistant', content: reply, metadata },
    ];

    try {
      const updatedChat = await AgentChat.findOneAndUpdate(
        { userId: req.user.id },
        {
          $setOnInsert: { userId: req.user.id },
          $push: {
            messages: {
              $each: [
                { role: 'user', content: message, metadata },
                { role: 'assistant', content: reply, metadata },
              ],
            },
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      return res.json({
        reply,
        messages: updatedChat?.messages ?? responseMessages,
      });
    } catch (dbWriteError) {
      console.error('[AgentChat] Failed to save history', {
        requestId,
        userId: req.user.id,
        message: dbWriteError.message,
      });
    }

    res.json({
      reply,
      messages: responseMessages,
    });
  } catch (error) {
    console.error('[AgentChat] Unexpected controller error', {
      requestId,
      userId: req.user?.id,
      message: error.message,
      statusCode: error.statusCode,
    });
    res.status(error.statusCode || 500).json({
      error: error.message || 'Failed to get AI response',
      reply: FALLBACK_AGENT_REPLY,
      messages: [],
    });
  }
};

export const getAgentHistory = async (req, res) => {
  try {
    const chat = await AgentChat.findOne({ userId: req.user.id });
    res.json({
      messages: chat?.messages ?? [],
    });
  } catch (error) {
    console.error('Error fetching agent history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

export const clearAgentHistory = async (req, res) => {
  try {
    await AgentChat.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { messages: [] } },
      { upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Chat history cleared' });
  } catch (error) {
    console.error('Error clearing agent history:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
};
