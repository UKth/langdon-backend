import client from "@libs/server/client";
import { User } from "@prisma/client";
import nodemailer, {
  SendMailOptions,
  SentMessageInfo,
  Transporter,
} from "nodemailer";

export interface ResponseType {
  ok: boolean;
  [key: string]: any;
}

export const isFriend = async (userId: number, targetId: number) => {
  const friend = await client.friend.findFirst({
    where: {
      OR: [
        {
          AND: [{ userId: userId }, { friendId: targetId }],
        },
        {
          AND: [{ userId: targetId }, { friendId: userId }],
        },
      ],
    },
  });
  return !!friend;
};

export const validBoard = async (collegeId: number, boardId: number) => {
  const board = await client.board.findUnique({
    where: { id: boardId },
  });

  return board?.collegeId === collegeId;
};

export const validPost = async (collegeId: number, postId: number) => {
  const post = await client.post.findUnique({
    where: { id: postId },
    include: {
      board: {
        select: {
          collegeId: true,
        },
      },
      createdBy: {
        select: {
          pushToken: true,
        },
      },
    },
  });

  return post?.board?.collegeId === collegeId ? post : null;
};

export const handleDates = (body: any) => {
  if (body === null || body === undefined || typeof body !== "object")
    return body;

  for (const key of Object.keys(body)) {
    const value = body[key];
    if (value instanceof Date) body[key] = value.valueOf();
    else if (typeof value === "object") handleDates(value);
  }
  return body;
};

export type contentType = {
  body: string;
  badge?: number;
  title?: string;
  subtitle?: string;
  data?: any;
};

export const sendManyPush = (pushList: {
  pushToken: string;
  content: contentType;
}) => {};

export const sendOnePush = (pushToken: string, content: contentType) => {
  // TODO
  // let expo = new Expo();
  if (!pushToken.length) {
    console.error("Empty token.");
    return;
  }

  const message = {
    to: pushToken,
    sound: "default",
    title: "College Table",
    ...content,
  };

  console.log("push sending...\n" + JSON.stringify(message));

  fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
};

export const sendMessagePush = (pushToken: string, msg: string) => {
  sendOnePush(pushToken, {
    subtitle: "Someone sent you a message",
    body: msg,
    data: {
      route: "Chatrooms",
    },
  });
};

export const sendCode = async ({
  address,
  code,
}: {
  address: string;
  code: number;
}) => {
  const mailhtml = mailHtmlGenerator(code);

  return await sendMail({
    address,
    subject: "College Table - Verify your email",
    mailhtml,
  });
};

export const sendMail = async ({
  address,
  subject,
  mailhtml,
}: {
  address: string;
  subject: string;
  mailhtml: string;
}) => {
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
    const mailOption: SendMailOptions = {
      from: process.env.NODEMAIL_EMAIL,
      to: address,
      subject,
      html: mailhtml,
    };

    const info: SentMessageInfo = await transporter.sendMail(mailOption);

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error(
      `Fail to send mail
      to: ${address}
      subject: ${subject}
      ${mailhtml}`,
      error
    );
    return false;
  }
};

export const getNameString = (user: User) => {
  return (
    user.firstName +
    " " +
    (user.middleName ? user.middleName + " " : "") +
    user.lastName
  );
};

export const whiteSpaceRemover = (text: string) => text.replace(/ /g, "");

export const mailHtmlGenerator = (code: number) => {
  return `
  <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
    <head>
      <meta
        http-equiv="Content-Type"
        content="text/html; charset=UTF-8"
      />
      <title>College Table verification code</title>
    </head>

    <body style="font-family: Calibri">
      <table cellspacing="0" width="100%" role="presentation">
        <tr>
          <td></td>
          <td width="600">

            <p style="font-size: 125%"><strong>Welcome to College Table</strong></p>
            <p>
              To verify your email address, enter the code below on the
              verification page:
            </p>
            <p style="font-size: 150%; text-align: center">
              <strong>${code}</strong>
            </p>
            <p>
              This code will expire in 3 minutes after the email is sent. Once
              the code expires, you will need to request a new verification code.
            </p>
            <p style="text-align: right;"><strong>College Table Support</strong></p>
          </td>
        </tr>
        <tr>
          <td></td>
          <td style="text-align: right">
            <img
              src="https://collegetable.vercel.app/logo_192x192.png"
              alt="College Table"
              height="60"
              width="60"
            />
          </td>
          <td></td>
        </tr>
      </table>
    </body>
  </html>`;
};
