import nodemailer from "nodemailer";

const sendEmail = async function (email, subject, message) {
  //create reuseble transpoter object using the default
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

    const companyName = "LMS SYSTEM";

  // Set the "from" field to include the company name
  const fromField = `"${companyName}" <${process.env.SMTP_FROM_EMAIL}>`;

  //   send mail with defined transport object
  await transporter.sendMail({
    from: fromField, //sender email
    to: email, // user email
    subject: subject, // Subject line
    html: message, // html body
  });
};

export default sendEmail;
