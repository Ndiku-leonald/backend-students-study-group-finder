const User = require('../models/user');
const AdminAccessCode = require('../models/AdminAccessCode');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomInt } = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /\d/;
const SYMBOL_REGEX = /[!@#$%&*()\-_=+\[\]{};:'",.<>/?\\|`~]/;

// Build the signed session token the frontend stores after login or registration.
// The token carries the minimum useful identity data so the frontend can route
// users without making an extra lookup on every page load.
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

// Strip sensitive fields before sending user data back to the client.
// Passwords never leave the server, and the frontend only receives profile data
// it needs for routing and display.
const buildSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  program: user.program,
  year: user.year,
  role: user.role,
  adminCode: user.adminCode || null
});

// Generate a unique admin code that is not already assigned to another user.
// Admin accounts need a separate identifier so they can be distinguished even
// if email addresses or names change later.
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

const isValidEmail = (value) => EMAIL_REGEX.test(value || '');

const hasSequentialPattern = (value) => {
  const text = (value || '').toLowerCase();

  for (let index = 0; index <= text.length - 4; index += 1) {
    let ascending = true;
    let descending = true;

    for (let offset = 0; offset < 3; offset += 1) {
      const current = text.charCodeAt(index + offset);
      const next = text.charCodeAt(index + offset + 1);

      if (Number.isNaN(current) || Number.isNaN(next) || next !== current + 1) {
        ascending = false;
      }

      if (Number.isNaN(current) || Number.isNaN(next) || next !== current - 1) {
        descending = false;
      }
    }

    if (ascending || descending) {
      return true;
    }
  }

  return false;
};

const containsPersonalInfo = (password, name, email) => {
  const normalizedPassword = (password || '').toLowerCase();
  const normalizedEmail = normalizeEmail(email);
  const emailLocalPart = normalizedEmail.split('@')[0] || '';
  const nameParts = (name || '')
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-z0-9]/g, ''))
    .filter((part) => part.length >= 3);

  if (emailLocalPart && normalizedPassword.includes(emailLocalPart)) {
    return true;
  }

  return nameParts.some((part) => normalizedPassword.includes(part));
};

const validatePassword = (password, name, email) => {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!UPPERCASE_REGEX.test(password)) {
    return 'Password must include at least one uppercase letter';
  }

  if (!LOWERCASE_REGEX.test(password)) {
    return 'Password must include at least one lowercase letter';
  }

  if (!NUMBER_REGEX.test(password)) {
    return 'Password must include at least one number';
  }

  if (!SYMBOL_REGEX.test(password)) {
    return 'Password must include at least one symbol';
  }

  if (hasSequentialPattern(password)) {
    return 'Password cannot contain sequential patterns like 1234 or abcd';
  }

  if (containsPersonalInfo(password, name, email)) {
    return 'Password cannot contain your name or email';
  }

  return null;
};

// Confirm the admin access code exists and is currently active.
// This prevents free-form admin signups and keeps the admin role controlled.
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
    // Accept a few alternate field names so the frontend can evolve safely.
    // The console logs are useful while demoing or debugging registration payloads.
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

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        message: 'Email must be a valid address like name@example.com'
      });
    }

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
      // Student accounts require academic profile information.
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
    const passwordError = validatePassword(password, name, email);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // bcrypt hashes the password before it reaches the database.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Admin users get a generated code; student users keep those fields empty.
    // This keeps the stored profile aligned with the account type.
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
    // Login accepts the same role split as registration, but validates against the stored user.
    // That means the client can send either a student or admin login request using the same handler.
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;
    const requestedRole = (req.body.role || '').toLowerCase();
    const accessCode = req.body.accessCode || req.body.adminAccessCode;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      const hasAnyUsers = await User.count();
      if (!hasAnyUsers) {
        return res.status(404).json({
          message: 'No accounts exist in the database yet. Please register again.'
        });
      }

      return res.status(404).json({ message: 'User not found. Check the email or register first.' });
    }

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
      // Backfill a code if an admin account predates the current schema.
      // This keeps older admin records compatible with the current auth flow.
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
  // Only admins can browse the user list.
  // The dashboard uses this for platform oversight and account management.
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
