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

// Get user by ID
export async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id, 'username fullName email avatarUrl');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
} 