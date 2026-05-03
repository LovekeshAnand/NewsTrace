import User from '../models/User.js';

export const register = async ({ name, email, password }) => {
  const exists = await User.findOne({ email });
  if (exists) throw Object.assign(new Error('Email already registered'), { statusCode: 400 });

  const user = await User.create({ name, email, password });
  const token = user.generateToken();
  return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
};

export const login = async ({ email, password }) => {
  if (!email || !password) throw Object.assign(new Error('Provide email and password'), { statusCode: 400 });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
  }

  const token = user.generateToken();
  return { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token };
};

export const getProfile = async (userId) => {
  return User.findById(userId).lean();
};
