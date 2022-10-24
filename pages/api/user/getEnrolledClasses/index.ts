import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import {
  ACCESS_TOKEN_EXPIRATION,
  errorMessages,
  REFRESH_TOKEN_EXPIRATION,
  VERIFICATION_CODE_EXPIRATION,
} from "@constants";
import jwt from "jsonwebtoken";

interface TokenInterface {
  id: number;
  collegeId: number;
  expiration: Date;
  iat: number;
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    accessToken,
  }: {
    accessToken: string;
  } = req.body;

  try {
    const {
      id: userId,
      expiration,
      iat,
    } = jwt.verify(accessToken, process.env.SECRET_KEY || "") as TokenInterface;

    if (expiration < new Date()) {
      return res.status(400).json({
        ok: false,
        error: errorMessages.user.tokenExpired,
        tokenExpired: true, // temporary
      });
    }

    const tokenUser = await client.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        enrolledClasses: {
          include: {
            course: true,
            sections: {
              include: {
                classMeetings: {
                  include: {
                    building: true,
                  },
                },
                instructor: true,
              },
            },
          },
        },
      },
    });

    if (!tokenUser) {
      return res.status(400).json({
        ok: false,
        error: errorMessages.user.userNotFound,
      });
    }

    return res.json({
      ok: true,
      enrolledClasses: tokenUser.enrolledClasses,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      ok: false,
      error: errorMessages.user.invalidToken,
    });
  }
}

export default handler;
