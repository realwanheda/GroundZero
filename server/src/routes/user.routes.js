import express from "express";
import { login } from "../controllers/user.controllers.js";
import { sendEmail } from "../controllers/email.controllers.js";
import { getUserDocuments } from "../controllers/document.controllers.js";
import { deleteDocument } from "../controllers/deletedoc.controllers.js";

const router = express.Router();
router.route("/register").post(login);
router.route("/send-email").post(sendEmail);
router.route("/getDocuments").post(getUserDocuments);
router.delete("/document/:id", deleteDocument);
export default router;
