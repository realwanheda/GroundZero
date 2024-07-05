import User from "../models/user.models.js";
import Document from "../models/document.models.js";

export const getUserDocuments = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).populate("documents");
    // console.log("User:", user);
    if (!user) return res.status(404).json({ message: "User not found" });
    const document = user.documents;
    res.status(200).json({ data: user });
  } catch (error) {
    console.log(error);
  }
};
