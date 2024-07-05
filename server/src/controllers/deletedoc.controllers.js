import Document from "../models/document.models.js";
import User from "../models/user.models.js"; // Assuming this is your User model

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedDocument = await Document.findByIdAndDelete(id);

    if (!deletedDocument) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Remove the document reference from the users table
    const users = await User.updateMany(
      { documents: id },
      { $pull: { documents: id } }
    );

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
