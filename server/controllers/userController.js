import User from "../models/Users.js";
import Resume from "../models/Resume.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Logic to Generate Token
const generateToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "5d",
  });
  return token;
};

// POST method : since we have to provide data
// Path : /api/users/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check is name,email & password is there:
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing Required fields." });
    }

    // check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already Exists" });
    }
    // create new user (checked all other blockage)
    // 1. ---Password encrypt
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 2. ---Generate the Token. & Return it
    const token = generateToken(newUser._id);
    newUser.password = undefined; // because we need to return the newUser as Response

    return res
      .status(200)
      .json({ message: "User Created Successfully", token, user: newUser });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Error creating User: \n" + error.message });
  }
};

// Controller for USER login:
// POST: /api/user/login
export const loginUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // check if password is correct
    if (!user.comparePassword(password)) {
      return res.status(400).json({ message: "Incorrect Password" });
    }
    // Return login success
    const token = generateToken(user._id);
    user.password = undefined;

    return res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    return res.status(400).json({ message: "Login Error: \n" + error.message });
  }
};

// controller for getting user by id
// GET: /api/users/data
export const getUserById = async (req, res) => {
  try {
    // in req ".userId" will be added later using MiddleWare
    const userId = req.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // return user
    user.password = undefined;
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(400).json({ message: "Login Error: \n" + error.message });
  }
};

export const getUserResumes = async (req, res) => {
  try {
    // we will get userId by middleware "Protect"
    const userId = req.userId;

    const resumes = await Resume.find({ userId });
    return res.status(200).json({ resumes });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};
