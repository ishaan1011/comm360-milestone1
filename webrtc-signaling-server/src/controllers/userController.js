import User from '../models/user.js';

// Get all users (for conversation creation)
export async function getAllUsers(req, res, next) {
  try {
    const users = await User.find({}, 'username fullName email avatarUrl')
      .sort({ fullName: 1, username: 1 });
    
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

// Get all users
export async function getUsers(req, res, next) {
  try {
    const users = await User.find({}, 'username fullName avatarUrl email');
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

// Get online users
export async function getOnlineUsers(req, res, next) {
  try {
    // This will be populated by the socket server
    // For now, return empty array - will be implemented with socket integration
    res.json({ onlineUsers: [] });
  } catch (err) {
    next(err);
  }
}

// Get user by ID
export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id, 'username fullName avatarUrl email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
} 