import Conversation from '../models/conversation.js';
import User from '../models/user.js';
import Message from '../models/message.js';

// List all conversations for the current user
export async function listConversations(req, res, next) {
  try {
    const userId = req.user.id;

    // Get user's conversations (DMs and groups they're members of)
    const userConversations = await Conversation.find({
      members: userId
    }).populate('members', 'username fullName avatarUrl');

    // Get all communities (communities are public)
    const communities = await Conversation.find({
      type: 'community'
    }).populate('members', 'username fullName avatarUrl');

    // Combine user conversations with communities
    const allConversations = [...userConversations, ...communities];

    res.json({ conversations: allConversations });
  } catch (err) {
    next(err);
  }
}

// Create a new conversation
export async function createConversation(req, res, next) {
  try {
    const { type, memberIds = [], name } = req.body;
    const userId = req.user.id;

    // Validate conversation type
    if (!['dm', 'group', 'community'].includes(type)) {
      return res.status(400).json({ message: 'Invalid conversation type' });
    }

    // For DMs, check if conversation already exists
    if (type === 'dm') {
      if (!memberIds || memberIds.length !== 1) {
        return res.status(400).json({ message: 'Direct messages must have exactly one other member' });
      }

      // Check if DM already exists between these users
      const existingDM = await Conversation.findOne({
        type: 'dm',
        members: { $all: [userId, memberIds[0]] }
      });

      if (existingDM) {
        return res.status(200).json({ 
          message: 'Direct message conversation already exists',
          conversation: existingDM 
        });
      }
    }

    // For groups, require name and members
    if (type === 'group') {
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Group name is required' });
      }
      if (!memberIds || memberIds.length === 0) {
        return res.status(400).json({ message: 'Group must have at least one member' });
      }
    }

    // For communities, require name
    if (type === 'community') {
      if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Community name is required' });
      }
    }

    // Create conversation
    const conversation = new Conversation({
      type,
      name: name?.trim(),
      members: type === 'community' ? [] : [userId, ...memberIds], // Communities start empty
      admins: [userId], // Creator is admin
      createdBy: userId,
    });

    await conversation.save();

    // Populate members for response
    await conversation.populate('members', 'username fullName avatarUrl');

    res.status(201).json({ 
      message: 'Conversation created successfully',
      conversation 
    });
  } catch (err) {
    next(err);
  }
}

// Get a specific conversation
export async function getConversation(req, res, next) {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId)
      .populate('members', 'username fullName avatarUrl');
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    
    res.json({ conversation });
  } catch (err) {
    next(err);
  }
}

// Add a member to a conversation
export async function addMember(req, res, next) {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is admin (for groups/communities) or member (for DMs)
    if (conversation.type !== 'dm' && !conversation.admins.includes(currentUserId)) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    if (conversation.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    conversation.members.push(userId);
    await conversation.save();

    res.json({ message: 'Member added successfully', conversation });
  } catch (err) {
    next(err);
  }
}

// Remove a member from a conversation
export async function removeMember(req, res, next) {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;
    const currentUserId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is admin (for groups/communities) or member (for DMs)
    if (conversation.type !== 'dm' && !conversation.admins.includes(currentUserId)) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    if (!conversation.members.includes(userId)) {
      return res.status(400).json({ message: 'User is not a member' });
    }

    conversation.members = conversation.members.filter(id => id.toString() !== userId);
    await conversation.save();

    res.json({ message: 'Member removed successfully', conversation });
  } catch (err) {
    next(err);
  }
}

// Delete a conversation
export async function deleteConversation(req, res, next) {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check permissions
    if (conversation.type === 'dm') {
      // For DMs, any member can delete
      if (!conversation.members.includes(userId)) {
        return res.status(403).json({ message: 'Not authorized to delete this conversation' });
      }
    } else {
      // For groups and communities, only admins can delete
      if (!conversation.admins.includes(userId)) {
        return res.status(403).json({ message: 'Only admins can delete groups and communities' });
      }
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversation: conversationId });

    // Delete the conversation
    await conversation.deleteOne();

    res.json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    next(err);
  }
} 