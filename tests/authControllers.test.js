process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-1234567890';

jest.mock('../models/user', () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn()
}));

jest.mock('../models/AdminAccessCode', () => ({
  findOne: jest.fn()
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock.jwt.token')
}));

const User = require('../models/user');
const AdminAccessCode = require('../models/AdminAccessCode');
const bcrypt = require('bcryptjs');
const { register, login } = require('../controllers/authControllers');

const buildRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe('authControllers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register returns 400 when required fields missing', async () => {
    const req = { body: { role: 'student' } };
    const res = buildRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Missing required registration fields' }));
  });

  test('login returns 400 when email/password missing', async () => {
    const req = { body: { email: '', password: '' } };
    const res = buildRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required' });
  });

  test('login returns 400 when user not found', async () => {
    User.findOne.mockResolvedValue(null);
    const req = { body: { email: 'missing@example.com', password: 'secret' } };
    const res = buildRes();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  test('login success returns token and user', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'student',
      program: 'CS',
      year: 2,
      adminCode: null,
      password: 'hashed',
      reload: jest.fn()
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const req = { body: { email: 'test@example.com', password: 'secret', role: 'student' } };
    const res = buildRes();

    await login(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      token: expect.any(String),
      user: expect.objectContaining({ email: 'test@example.com' })
    }));
  });
});
