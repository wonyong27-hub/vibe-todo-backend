import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// updatedAt 자동 업데이트
todoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;

