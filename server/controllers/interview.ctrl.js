import InterviewSession from '../models/InterviewSession.js';
import { generateInterviewQuestions, evaluateAnswer } from '../services/groq.js';
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
        res.status(error.statusCode || 500).json({ error: error.message || 'Failed to start interview' });
    }
};

export const answerQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionId, answer } = req.body;

        if (!questionId || !answer?.trim()) {
            return res.status(400).json({ error: 'Question and answer are required' });
        }

        const session = await InterviewSession.findById(id);
        if (!session) return res.status(404).json({ error: 'Session not found' });

        // Authorization check
        if (session.userId.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized for this session' });
        }

        const questionObj = session.questions.find(q => q.id === questionId);
        if (!questionObj) return res.status(404).json({ error: 'Question not found' });

        // Evaluate answer via Groq
        const evaluation = await evaluateAnswer(session.role, questionObj.question, answer);

        // Save answer and feedback atomically so concurrent duplicate submits cannot both succeed.
        const updatedSession = await InterviewSession.findOneAndUpdate(
            {
                _id: id,
                userId: req.user.id,
                'questions.id': questionId,
                'answers.questionId': { $ne: questionId },
            },
            {
                $push: {
                    answers: { questionId, answer: answer.trim() },
                    feedback: {
                        questionId,
                        score: evaluation.score || 0,
                        feedback: evaluation.feedback || 'No feedback',
                    },
                },
            },
            { new: true }
        );

        if (!updatedSession) {
            return res.status(400).json({ error: 'Question already answered' });
        }

        // Recalculate total average score after the atomic update.
        const totalScore = updatedSession.feedback.reduce((sum, f) => sum + f.score, 0);
        updatedSession.score = Math.round(totalScore / updatedSession.feedback.length);

        await updatedSession.save();

        res.json({
            evaluation,
            sessionDetails: {
                answersCount: updatedSession.answers.length,
                totalQuestions: updatedSession.questions.length,
                currentScore: updatedSession.score
            }
        });

    } catch (error) {
        console.error('Error answering question:', error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Failed to process answer' });
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
