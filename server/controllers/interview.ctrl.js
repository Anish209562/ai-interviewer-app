import InterviewSession from '../models/InterviewSession.js';
import { generateInterviewQuestions, evaluateAnswer } from '../services/gemini.js';
import { v4 as uuidv4 } from 'uuid';

export const startInterview = async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({ error: 'Role is required' });
        }

        const questionsList = await generateInterviewQuestions(role);
        const questions = questionsList.map(q => ({
            id: uuidv4(),
            question: q
        }));

        const session = await InterviewSession.create({
            userId: req.user.id,
            role,
            questions,
            answers: [],
            feedback: [],
            score: 0
        });

        res.status(201).json(session);
    } catch (error) {
        console.error('Error starting interview:', error);
        res.status(500).json({ error: 'Failed to start interview' });
    }
};

export const answerQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionId, answer } = req.body;

        const session = await InterviewSession.findById(id);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        // Authorization check
        if (session.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized for this session' });
        }

        const questionObj = session.questions.find(q => q.id === questionId);
        if (!questionObj) return res.status(404).json({ error: 'Question not found' });

        // Evaluate answer via Gemini
        const evaluation = await evaluateAnswer(session.role, questionObj.question, answer);

        // Save answer and feedback
        session.answers.push({ questionId, answer });
        session.feedback.push({
            questionId,
            score: evaluation.score || 0,
            feedback: evaluation.feedback || 'No feedback'
        });

        // Recalculate total average score
        const totalScore = session.feedback.reduce((sum, f) => sum + f.score, 0);
        session.score = Math.round(totalScore / session.feedback.length);

        await session.save();

        res.json({
            evaluation,
            sessionDetails: {
                answersCount: session.answers.length,
                totalQuestions: session.questions.length,
                currentScore: session.score
            }
        });

    } catch (error) {
        console.error('Error answering question:', error);
        res.status(500).json({ error: 'Failed to process answer' });
    }
};

export const getHistory = async (req, res) => {
    try {
        const sessions = await InterviewSession.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

export const getSession = async (req, res) => {
    try {
        const session = await InterviewSession.findById(req.params.id);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        if (session.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized for this session' });
        }
        res.json(session);
    } catch (error) {
        console.error('Error fetching session:', error);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
};
