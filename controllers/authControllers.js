const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';

exports.register = async (req, res) => {
  try {
    const { name, email, password, program, year } = req.body;
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
