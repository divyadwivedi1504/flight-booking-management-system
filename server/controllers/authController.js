const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const payload = (user) => ({
  token: sign(user),
  user: { id: user._id, name: user.name, email: user.email, role: user.role },
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.status(201).json(payload(user));
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(password || '', user.password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json(payload(user));
  } catch (err) {
    next(err);
  }
};

exports.me = (req, res) => res.json(req.user);
