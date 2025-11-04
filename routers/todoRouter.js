const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');

// 할일 목록 조회 라우터
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: '할일 목록 조회 성공',
      todos: todos
    });
  } catch (error) {
    console.error('할일 목록 조회 오류:', error);
    res.status(500).json({ 
      error: '할일 목록 조회 중 오류가 발생했습니다.' 
    });
  }
});

// 할일 생성 라우터
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ 
        error: '할일 내용을 입력해주세요.' 
      });
    }

    const todo = new Todo({
      text: text.trim()
    });

    const savedTodo = await todo.save();
    console.log('할일 저장 완료:', savedTodo);
    console.log('저장 위치: cluster.c0hkr5i.mongodb.net / todo-db / todos');
    res.status(201).json({
      message: '할일이 저장되었습니다.',
      todo: savedTodo
    });
  } catch (error) {
    console.error('할일 저장 오류:', error);
    res.status(500).json({ 
      error: '할일 저장 중 오류가 발생했습니다.' 
    });
  }
});

// 할일 수정 라우터
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ 
        error: '할일 내용을 입력해주세요.' 
      });
    }

    const todo = await Todo.findByIdAndUpdate(
      id,
      { text: text.trim() },
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ 
        error: '할일을 찾을 수 없습니다.' 
      });
    }

    res.status(200).json({
      message: '할일이 수정되었습니다.',
      todo: todo
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: '유효하지 않은 할일 ID입니다.' 
      });
    }
    console.error('할일 수정 오류:', error);
    res.status(500).json({ 
      error: '할일 수정 중 오류가 발생했습니다.' 
    });
  }
});

// 할일 삭제 라우터
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await Todo.findByIdAndDelete(id);

    if (!todo) {
      return res.status(404).json({ 
        error: '할일을 찾을 수 없습니다.' 
      });
    }

    res.status(200).json({
      message: '할일이 삭제되었습니다.',
      todo: todo
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: '유효하지 않은 할일 ID입니다.' 
      });
    }
    console.error('할일 삭제 오류:', error);
    res.status(500).json({ 
      error: '할일 삭제 중 오류가 발생했습니다.' 
    });
  }
});

module.exports = router;

