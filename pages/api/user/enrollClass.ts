import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";
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
    classId,
    accessToken,
  }: {
    classId: number;
    accessToken: string;
  } = req.body;

  try {
    const {
      id: userId,
      collegeId,
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
        id: userId,
      },
    });

    if (!tokenUser) {
      return res.status(400).json({
        ok: false,
        error: errorMessages.user.userNotFound,
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
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      ok: false,
      error: errorMessages.user.invalidToken,
    });
  }
}

export default handler;
