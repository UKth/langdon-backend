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
    userId,
    classId,
    accessToken,
  }: {
    userId: number;
    classId: number;
    accessToken: string;
  } = req.body;

  try {
    const { id, collegeId, expiration, iat } = jwt.verify(
      accessToken,
      process.env.SECRET_KEY || ""
    ) as TokenInterface;

    if (id !== userId) {
      return res
        .status(400)
        .json({ ok: false, error: errorMessages.user.tokenNotMatched });
    }

    if (expiration > new Date()) {
      return res.status(400).json({
        ok: false,
        error: errorMessages.user.tokenExpired,
        tokenExpired: true, // temporary
      });
    }

    const cls = await client.class.findUnique({
      where: { id: classId },
      include: {
        course: true,
      },
    });
    if (!cls) {
      return res.status(400).json({
        ok: false,
        error: errorMessages.user.classNotFound,
      });
    }
    if (cls.course.collegeId !== collegeId) {
      return res.status(400).json({
        ok: false,
        error: errorMessages.user.invalidClass,
      });
    }
    const tokenUser = await client.user.findUnique({
      where: {
        id,
      },
    });

    if (!tokenUser) {
      return res.status(400).json({
        ok: false,
        error: errorMessages.user.userNotFound,
      });
    }

    if (tokenUser.id !== userId) {
      return res.status(400).json({
        ok: false,
        error: errorMessages.user.invalidToken,
      });
    }

    const updatedUser = await client.user.update({
      where: {
        id: tokenUser.id,
      },
      data: {
        enrolledClasses: {
          connect: {
            id: classId,
          },
        },
      },
      include: {
        enrolledClasses: true,
      },
    });
    console.log(updatedUser);
    return res.json({
      ok: true,
    });
  } catch {
    return res.status(400).json({
      ok: false,
      error: errorMessages.user.invalidToken,
    });
  }
}

export default handler;
