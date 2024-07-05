import User from "../models/user.models.js";

export const login = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (!user) {
      const newUser = new User(req.body);
      await newUser.save();
      return res.status(201).json({
        data: newUser,
        message: "User created successfully",
      });
    } else {
      return res.status(200).json({
        data: user,
        message: "User already exists Login to continue",
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
