import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";
import jwt from "jsonwebtoken";
import { Class } from "@prisma/client";

interface TokenInterface {
  id: number;
  collegeId: number;
  expiration: Date;
  iat: number;
}

const includeClass = (classes: Class[], id: number) => {
  for (let i = 0; i < classes.length; i++) {
    if (classes[i].id === id) {
      return true;
    }
  }
  return false;
};

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
        id: userId,
      },
      include: {
        enrolledClasses: true,
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

    if (!includeClass(tokenUser.enrolledClasses, classId)) {
      return res.status(400).json({
        ok: false,
        error: errorMessages.user.notEnrolledClass,
      });
    }

    const updatedUser = await client.user.update({
      where: {
        id: tokenUser.id,
      },
      data: {
        enrolledClasses: {
          disconnect: {
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
