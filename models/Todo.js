const mongoose = require('mongoose');
const todoSchema = require('./todoSchema');

// 컬렉션 이름을 명시적으로 지정 (MongoDB Compass에서 확인 가능)
const Todo = mongoose.model('Todo', todoSchema, 'todos');

module.exports = Todo;

