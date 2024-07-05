import nodemailer from "nodemailer";
export const sendEmail = async (req, res) => {
  try {
    const { email, url } = req.body;
    let transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GOOGLE_EMAIL_ID, // Your email address
        pass: process.env.GOOGLE_EMAIL_PASSWORD, // Your email password
      },
    });

    await transporter.sendMail({
      from: '"Vabhav Tripathi" <vabhavtripathi15@gmail.com>', // Sender email address and name
      to: email, // Recipient email address
      subject: "Document Sharing", // Subject line
      html: `<p>Hi there,</p><p>Here is the link to the shared document: <a href="${url}">${url}</a></p>`, // HTML body content with the shared document link
    });

    // Send success response
    res.status(200).json({ message: "Email sent successfully." });
  } catch (error) {
    // If there's an error, send error response
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
};
