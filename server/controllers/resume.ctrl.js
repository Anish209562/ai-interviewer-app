import { analyzeResume } from '../services/groq.js';

export const analyzeUserResume = async (req, res) => {
    try {
        const { resumeText } = req.body;
        if (!resumeText) {
            return res.status(400).json({ error: 'Please provide resume text' });
        }

        const analysis = await analyzeResume(resumeText);
        res.json(analysis);
    } catch (error) {
        console.error('Error analyzing resume:', error);
        res.status(error.statusCode || 500).json({ error: error.message || 'Failed to analyze resume' });
    }
};
