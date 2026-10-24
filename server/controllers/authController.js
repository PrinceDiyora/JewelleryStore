const User = require('../models/User');
const { ah, httpError, signToken } = require('../utils/helpers');

exports.register = ah(async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) throw httpError(400, 'Name, email and password are required');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  // role is never taken from the request: new sign-ups are always customers
  const user = await User.create({ name, email, phone, password });
  res.status(201).json({ token: signToken(user._id), user });
});

exports.login = ah(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email and password are required');
  const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw httpError(401, 'Incorrect email or password');
  res.json({ token: signToken(user._id), user });
});

exports.getMe = (req, res) => res.json(req.user);

exports.updateMe = ah(async (req, res) => {
  const { name, phone, address } = req.body;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (address) req.user.address = { ...req.user.address.toObject(), ...address };
  await req.user.save();
  res.json(req.user);
});

exports.changePassword = ah(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) throw httpError(400, 'New password must be at least 6 characters');
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword || ''))) throw httpError(400, 'Current password is incorrect');
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated' });
});
