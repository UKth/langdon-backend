import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType, sendCode } from "@libs/server/util";
import nodemailer, {
  SendMailOptions,
  SentMessageInfo,
  Transporter,
} from "nodemailer";
import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";

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

  const user = await client.user.findUnique({
    where: {
      email,
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
        .json({ ok: false, error: errorMessages.user.codeNotCreated });
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
        .json({ ok: false, error: errorMessages.user.codeNotCreated });
    }
  }

  if (email === "tester123@wisc.edu") {
    res.send({
      ok: true,
      ...(user
        ? {
            user: {
              id: user.id,
            },
          }
        : {}),
    });
  }

  if (await sendCode({ address: email, code })) {
    res.send({
      ok: true,
      ...(user
        ? {
            user: {
              id: user.id,
            },
          }
        : {}),
    });
  } else {
    res.send({ ok: false, error: "Fail to send mail. Please try again." });
  }
}

export default withHandler({ methods: ["POST"], handler, isPrivate: false });
