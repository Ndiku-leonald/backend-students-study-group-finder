const User = require('../models/user');
const AdminAccessCode = require('../models/AdminAccessCode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomInt } = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';

const buildToken = (user) => jwt.sign(
  {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    adminCode: user.adminCode || null
  },
  JWT_SECRET,
  { expiresIn: '1d' }
);

const buildSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  program: user.program,
  year: user.year,
  role: user.role,
  adminCode: user.adminCode || null
});

const generateAdminCode = async () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = `${alphabet[randomInt(alphabet.length)]}${String(randomInt(100)).padStart(2, '0')}`;
    const existing = await User.findOne({ where: { adminCode: code } });

    if (!existing) {
      return code;
    }
  }

  throw new Error('Unable to generate unique admin code');
};

const normalizeAccessCode = (value) => (value || '').trim().toLowerCase();
const normalizeEmail = (value) => (value || '').trim().toLowerCase();

const verifyAdminAccessCode = async (accessCode) => {
  const normalizedCode = normalizeAccessCode(accessCode);

  if (!normalizedCode) {
    return false;
  }

  const matchedCode = await AdminAccessCode.findOne({
    where: {
      code: normalizedCode,
      isActive: true
    }
  });

  return !!matchedCode;
};

exports.register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);

    const name = req.body.name || req.body.fullName || req.body.username;
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;
    const role = (req.body.role || 'student').toLowerCase();
    const accessCode = req.body.accessCode || req.body.adminAccessCode;
    const program = req.body.program || req.body.studyProgram || req.body.major;
    const yearValue = req.body.year ?? req.body.academicYear ?? req.body.level;

    console.log('Extracted fields:', { name, email, password: password ? '[HIDDEN]' : undefined, role, program, yearValue });

    const missingFields = [];

    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either student or admin' });
    }

    if (role === 'admin') {
      const accessCodeOk = await verifyAdminAccessCode(accessCode);

      if (!accessCodeOk) {
        return res.status(403).json({ message: 'Invalid admin access code' });
      }
    }

    if (role === 'student') {
      if (!program) missingFields.push('program');
      if (yearValue === undefined || yearValue === null || yearValue === '') missingFields.push('year');
    }

    if (missingFields.length) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({
        message: 'Missing required registration fields',
        missingFields
      });
    }

    const year = yearValue === undefined || yearValue === null || yearValue === ''
      ? null
      : Number(yearValue);

    if (role === 'student' && yearValue !== undefined && yearValue !== null && yearValue !== '' && Number.isNaN(year)) {
      console.log('Invalid year:', yearValue);
      return res.status(400).json({
        message: 'Year must be a valid number'
      });
    }

    console.log('Checking for existing user...');
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(409).json({ message: 'Email is already registered' });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating user...');
    const adminCode = role === 'admin' ? await generateAdminCode() : null;
    const normalizedProgram = role === 'admin' ? null : program;
    const normalizedYear = role === 'admin' ? null : year;

    const createdUser = await User.create({
      name,
      email,
      password: hashedPassword,
      program: normalizedProgram,
      year: normalizedYear,
      role,
      adminCode
    });

    const user = await User.findByPk(createdUser.id);

    console.log('User created:', user.id);
    const token = buildToken(user);
    const safeUser = buildSafeUser(user);

    console.log('Registration successful for:', email);
    res.json({ token, user: safeUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    const requestedRole = (req.body.role || '').toLowerCase();
    const accessCode = req.body.accessCode || req.body.adminAccessCode;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (requestedRole && requestedRole !== user.role) {
      return res.status(403).json({ message: `This account is registered as ${user.role}` });
    }

    if (user.role === 'admin') {
      const accessCodeOk = await verifyAdminAccessCode(accessCode);

      if (!accessCodeOk) {
        return res.status(403).json({ message: 'Invalid admin access code' });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    if (user.role === 'admin' && !user.adminCode) {
      user.adminCode = await generateAdminCode();
      await user.save();
    }

    await user.reload();

    const token = buildToken(user);

    res.json({
      token,
      user: buildSafeUser(user)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'adminCode'] });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
