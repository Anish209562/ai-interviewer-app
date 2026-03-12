import mongoose from 'mongoose';

const agentMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      quickAction: {
        type: String,
        default: '',
      },
      role: {
        type: String,
        default: '',
      },
      techStack: {
        type: String,
        default: '',
      },
      experienceLevel: {
        type: String,
        default: '',
      },
    },
  },
  { _id: false, timestamps: true }
);

const agentChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    messages: {
      type: [agentMessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const AgentChat = mongoose.model('AgentChat', agentChatSchema);

export default AgentChat;
