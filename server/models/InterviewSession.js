import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    questions: [{
        id: String,
        question: String,
    }],
    answers: [{
        questionId: String,
        answer: String,
    }],
    feedback: [{
        questionId: String,
        score: Number,
        feedback: String,
    }],
    score: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export default InterviewSession;
