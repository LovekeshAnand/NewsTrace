import * as authService from '../services/authService.js';

// Register a new user
export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

// Login and return JWT
export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

// Get current user profile
export const me = async (req, res) => {
  res.json({ success: true, data: req.user });
};
