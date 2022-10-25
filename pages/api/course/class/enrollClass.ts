import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  {
    userId,
    collegeId,
  }: {
    userId: number;
    collegeId: number;
  }
) {
  const {
    classId,
  }: {
    classId: number;
  } = req.body;

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
}

export default withHandler({ methods: ["POST"], handler });
