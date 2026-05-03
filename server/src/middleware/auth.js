import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { jwt as jwtConfig } from '../config/index.js';

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(header.split(' ')[1], jwtConfig.secret);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ success: false, error: 'User not found' });
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  next();
};
