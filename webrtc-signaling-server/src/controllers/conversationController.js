import Conversation from '../models/conversation.js';
import User from '../models/user.js';

// List all conversations for the current user
export async function listConversations(req, res, next) {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ members: userId })
      .populate('members', 'username fullName avatarUrl')
      .populate('lastMessage');
    res.json({ conversations });
  } catch (err) {
    next(err);
  }
}

// Create a new conversation (DM, group, or community)
export async function createConversation(req, res, next) {
  try {
    const { type, name, memberIds } = req.body;
    const userId = req.user.id;
    const members = Array.from(new Set([userId, ...(memberIds || [])]));
    const conversation = new Conversation({
      type,
      name: type === 'dm' ? undefined : name,
      members,
      admins: [userId],
      createdBy: userId,
    });
    await conversation.save();
    res.status(201).json({ conversation });
  } catch (err) {
    next(err);
  }
}

// Get a conversation by ID
export async function getConversation(req, res, next) {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id)
      .populate('members', 'username fullName avatarUrl')
      .populate('lastMessage');
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    res.json({ conversation });
  } catch (err) {
    next(err);
  }
}

// Add a member to a conversation
export async function addMember(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', 'username fullName avatarUrl');
    res.json({ conversation });
  } catch (err) {
    next(err);
  }
}

// Remove a member from a conversation
export async function removeMember(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { $pull: { members: userId } },
      { new: true }
    ).populate('members', 'username fullName avatarUrl');
    res.json({ conversation });
  } catch (err) {
    next(err);
  }
}

// Delete a conversation
export async function deleteConversation(req, res, next) {
  try {
    const { id } = req.params;
    await Conversation.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
} 