const Todo = require('../models/Todo');

// Get all todos for the authenticated user
exports.getAllTodos = async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch todos',
      error: error.message 
    });
  }
};

// Create a new todo
exports.createTodo = async (req, res) => {
  try {
    if (!req.body.text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide todo text'
      });
    }

    const newTodo = new Todo({
      user: req.user.userId,
      text: req.body.text,
      completed: req.body.completed || false,
      inProgress: req.body.inProgress || false,
      priority: req.body.priority || 'medium',
      category: req.body.category || 'other',
      dueDate: req.body.dueDate || null
    });
    
    const savedTodo = await newTodo.save();
    
    res.status(201).json({
      success: true,
      data: savedTodo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create todo',
      error: error.message
    });
  }
};

// Get a single todo by ID
exports.getTodoById = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.userId });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch todo',
      error: error.message
    });
  }
};

// Update a todo
exports.updateTodo = async (req, res) => {
  try {
    const { text, completed, inProgress, priority, category, dueDate } = req.body;
    
    // Make sure at least one field is being updated
    if (!text && completed === undefined && inProgress === undefined && !priority && !category && !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fields to update'
      });
    }
    
    // Build the update object with only provided fields
    const updateData = {
      updatedAt: Date.now()
    };
    if (text !== undefined) updateData.text = text;
    if (completed !== undefined) updateData.completed = completed;
    if (inProgress !== undefined) updateData.inProgress = inProgress;
    if (priority !== undefined) updateData.priority = priority;
    if (category !== undefined) updateData.category = category;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: todo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update todo',
      error: error.message
    });
  }
};

// Delete a todo
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'Todo not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete todo',
      error: error.message
    });
  }
};