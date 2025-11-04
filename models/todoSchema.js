const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true // createdAt과 updatedAt 자동 생성
});

module.exports = todoSchema;


