import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";
import nodemailer, {
  SendMailOptions,
  SentMessageInfo,
  Transporter,
} from "nodemailer";
import { errorMessages } from "@constants";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.user.emailNotRecieved });
  }

  const college = await client.college.findUnique({
    where: {
      mailFooter: email.split("@")[1],
    },
  });

  if (!college) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.user.collegeForEmailNotExist });
  }

  const code = Math.floor(100000 + Math.random() * 900000);

  const foundCode = await client.verificationCode.findUnique({
    where: {
      email,
    },
  });

  let newCode;

  if (foundCode) {
    newCode = await client.verificationCode.update({
      where: {
        email,
      },
      data: {
        code,
      },
    });

    if (!newCode) {
      return res
        .status(400)
        .json({ ok: false, error: errorMessages.user.tokenNotCreated });
    }
  } else {
    newCode = await client.verificationCode.create({
      data: {
        code,
        email,
      },
    });

    if (!newCode) {
      return res
        .status(400)
        .json({ ok: false, error: errorMessages.user.tokenNotCreated });
    }
  }

  let transporter: Transporter = nodemailer.createTransport({
    /* Gmail Host */
    host: "smtp.gmail.com",
    /* Mail port */
    port: 465,
    /* your Mail Service Accounts */
    auth: {
      /* Gmail EMAIL */
      user: process.env.MAILS_EMAIL,
      /* Gmail PWD */
      pass: process.env.MAILS_PWD,
    },
    secure: true,
  });

  try {
    // let { name, email, subject, message } = req.body;

    const mailhtml = `
      <h3>Verification Code</h3>
      <br>
      <h3>${code}</h3>
  `;

    const mailOption: SendMailOptions = {
      from: process.env.NODEMAIL_EMAIL,
      to: email,
      subject: "College Table - Verify your email",
      html: mailhtml,
    };

    const info: SentMessageInfo = await transporter.sendMail(mailOption);

    console.log("Email sent:", info.messageId);

    res.send({ ok: true });
  } catch (error) {
    res.send({ ok: false, error });
  }
}

export default handler;
