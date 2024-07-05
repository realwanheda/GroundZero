// const { Schema, model } = require("mongoose");
import mongoose from "mongoose";
const { Schema, model } = mongoose;

const documentSchema = new Schema({
  _id: String,
  title: {
    type: String,
    // required: true,
    // default: "Untitled Document",
  },
  data: Object,
  users: [
    {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
  ],
});
const Document = model("Document", documentSchema);
export default Document;
