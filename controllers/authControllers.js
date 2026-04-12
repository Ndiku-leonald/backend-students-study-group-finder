const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';

exports.register = async (req, res) => {
  try {
    const name = req.body.name || req.body.fullName || req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const program = req.body.program || req.body.studyProgram || req.body.major;
    const yearValue = req.body.year ?? req.body.academicYear ?? req.body.level;

    const missingFields = [];

    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');

    if (missingFields.length) {
      return res.status(400).json({
        message: 'Missing required registration fields',
        missingFields
      });
    }

    const year = yearValue === undefined || yearValue === null || yearValue === ''
      ? null
      : Number(yearValue);

    if (yearValue !== undefined && yearValue !== null && yearValue !== '' && Number.isNaN(year)) {
      return res.status(400).json({
        message: 'Year must be a valid number'
      });
    }

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, program, year, role: 'student' });
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      program: user.program,
      year: user.year,
      role: user.role
    };
    res.json(safeUser);
  } catch (error) {
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
