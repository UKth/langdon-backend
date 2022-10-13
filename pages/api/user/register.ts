import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import {
  errorMessages,
  JWT_TOKEN_EXPIRATION,
  VERIFICATION_TOKEN_EXPIRATION,
} from "@constants";
import jwt from "jsonwebtoken";

// mail.setApiKey(process.env.SENDGRID_KEY!);
// const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { email, token } = req.body;

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

  const foundToken = await client.token.findUnique({
    where: {
      email,
    },
  });

  if (!foundToken) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.user.tokenForEmailNotExist });
  }

  if (foundToken.token !== token) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.user.tokenNotMatch });
  }

  if (
    Date.now() - foundToken.updatedAt.valueOf() >
    VERIFICATION_TOKEN_EXPIRATION + 5
  ) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.user.tokenExpired });
  }

  let user = await client.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    user = await client.user.create({
      data: {
        email,
        college: {
          connect: {
            id: college.id,
          },
        },
      },
    });
  }

  if (!user) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.user.createUserFailed });
  }

  const data = {
    id: user.id,
    collegeId: college.id,
    expiration: Date.now() + JWT_TOKEN_EXPIRATION,
  };

  const jwtToken = jwt.sign(
    {
      id: user.id,
      collegeId: college.id,
      expiration: Date.now() + JWT_TOKEN_EXPIRATION,
    },
    process.env.SECRET_KEY || ""
  );

  return res.json({
    ok: true,
    token: jwtToken,
  });
}

export default handler;
