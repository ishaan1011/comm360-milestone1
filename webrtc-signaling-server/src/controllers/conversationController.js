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

    // Handle DM creation with validation
    if (type === 'dm') {
      // Validate DM requirements
      if (!memberIds || memberIds.length !== 1) {
        return res.status(400).json({ 
          message: 'Direct messages must have exactly one other participant' 
        });
      }

      const otherUserId = memberIds[0];

      // Prevent self-DM
      if (otherUserId === userId) {
        return res.status(400).json({ 
          message: 'Cannot create a direct message with yourself' 
        });
      }

      // Check if the other user exists
      const otherUser = await User.findById(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ 
          message: 'Selected user not found' 
        });
      }

      // Check if DM already exists between these two users
      const existingDM = await Conversation.findOne({
        type: 'dm',
        members: { $all: [userId, otherUserId] },
        $expr: { $eq: [{ $size: '$members' }, 2] }
      }).populate('members', 'username fullName avatarUrl');

      if (existingDM) {
        return res.json({ 
          conversation: existingDM,
          message: 'Existing conversation found'
        });
      }

      // Create new DM
      const conversation = new Conversation({
        type: 'dm',
        members: [userId, otherUserId],
        createdBy: userId,
      });
      await conversation.save();
      
      const populatedConversation = await conversation.populate('members', 'username fullName avatarUrl');
      res.status(201).json({ conversation: populatedConversation });
      return;
    }

    // Handle group/community creation
    const members = Array.from(new Set([userId, ...(memberIds || [])]));
    const conversation = new Conversation({
      type,
      name: type === 'dm' ? undefined : name,
      members,
      admins: [userId],
      createdBy: userId,
    });
    await conversation.save();
    
    const populatedConversation = await conversation.populate('members', 'username fullName avatarUrl');
    res.status(201).json({ conversation: populatedConversation });
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