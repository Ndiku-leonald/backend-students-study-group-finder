const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';

exports.register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);

    const name = req.body.name || req.body.fullName || req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const program = req.body.program || req.body.studyProgram || req.body.major;
    const yearValue = req.body.year ?? req.body.academicYear ?? req.body.level;

    console.log('Extracted fields:', { name, email, password: password ? '[HIDDEN]' : undefined, program, yearValue });

    const missingFields = [];

    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');

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

    if (yearValue !== undefined && yearValue !== null && yearValue !== '' && Number.isNaN(year)) {
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
    const role = email.includes('admin') ? 'admin' : 'student';

    const user = await User.create({ name, email, password: hashedPassword, program, year, role });

    console.log('User created:', user.id);
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      program: user.program,
      year: user.year,
      role: user.role
    };

    console.log('Registration successful for:', email);
    res.json({ token, user: safeUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        program: user.program,
        year: user.year,
        role: user.role
      }
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
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
