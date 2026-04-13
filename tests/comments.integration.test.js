process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-1234567890';

const express = require('express');
const request = require('supertest');

jest.mock('../middleware/authMiddleware', () => (req, res, next) => {
  req.user = { id: 1, role: 'student' };
  next();
});

jest.mock('../models/Post', () => ({
  findByPk: jest.fn()
}));

jest.mock('../models/Group', () => ({
  findByPk: jest.fn()
}));

jest.mock('../models/GroupMember', () => ({
  findOne: jest.fn()
}));

jest.mock('../models/Comment', () => ({
  findAll: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn()
}));

jest.mock('../models/user', () => ({}));

const Post = require('../models/Post');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const Comment = require('../models/Comment');
const commentRoutes = require('../routes/commentRoutes');

describe('comments integration routes', () => {
  const app = express();
  app.use(express.json());
  app.use('/api/comments', commentRoutes);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/comments/post/:postId returns comments for authorized member', async () => {
    Post.findByPk.mockResolvedValue({ id: 7, groupId: 4 });
    Group.findByPk.mockResolvedValue({ id: 4, userId: 99 });
    GroupMember.findOne.mockResolvedValue({ id: 10, groupId: 4, userId: 1 });
    Comment.findAll.mockResolvedValue([{ id: 1, content: 'Nice post' }]);

    const res = await request(app).get('/api/comments/post/7');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1, content: 'Nice post' }]);
  });

  test('POST /api/comments/post/:postId creates comment', async () => {
    Post.findByPk.mockResolvedValue({ id: 7, groupId: 4 });
    Group.findByPk.mockResolvedValue({ id: 4, userId: 99 });
    GroupMember.findOne.mockResolvedValue({ id: 10, groupId: 4, userId: 1 });
    Comment.create.mockResolvedValue({ id: 5 });
    Comment.findByPk.mockResolvedValue({ id: 5, content: 'Great idea' });

    const res = await request(app)
      .post('/api/comments/post/7')
      .send({ content: 'Great idea' });

    expect(res.statusCode).toBe(200);
    expect(Comment.create).toHaveBeenCalledWith({
      postId: 7,
      userId: 1,
      content: 'Great idea'
    });
    expect(res.body).toEqual({ id: 5, content: 'Great idea' });
  });
});
