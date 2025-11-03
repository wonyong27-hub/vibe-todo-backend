import express from 'express';
import mongoose from 'mongoose';
import Todo from '../models/Todo.js';

const router = express.Router();

// 모든 할일 조회
router.get('/', async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: '데이터베이스에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.' 
      });
    }
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    console.error('할일 조회 오류:', error);
    res.status(500).json({ 
      message: error.message || '서버 오류가 발생했습니다.' 
    });
  }
});

// 단일 할일 조회
router.get('/:id', async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: '데이터베이스에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.' 
      });
    }
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: '할일을 찾을 수 없습니다.' });
    }
    res.json(todo);
  } catch (error) {
    console.error('할일 조회 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

// 새로운 할일 생성
router.post('/', async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: '데이터베이스에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.' 
      });
    }
    const todo = new Todo(req.body);
    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    console.error('할일 생성 오류:', error);
    res.status(400).json({ message: error.message });
  }
});

// 할일 수정
router.put('/:id', async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: '데이터베이스에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.' 
      });
    }
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!todo) {
      return res.status(404).json({ message: '할일을 찾을 수 없습니다.' });
    }
    res.json(todo);
  } catch (error) {
    console.error('할일 수정 오류:', error);
    res.status(400).json({ message: error.message });
  }
});

// 할일 삭제
router.delete('/:id', async (req, res) => {
  try {
    // MongoDB 연결 상태 확인
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        message: '데이터베이스에 연결되지 않았습니다. 잠시 후 다시 시도해주세요.' 
      });
    }
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: '할일을 찾을 수 없습니다.' });
    }
    res.json({ message: '할일이 삭제되었습니다.' });
  } catch (error) {
    console.error('할일 삭제 오류:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

