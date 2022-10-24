import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { isFriend, ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  data?: {
    userId?: number;
    collegeId?: number;
  }
) {
  const userId = data?.userId ?? 0;
  const collegeId = data?.collegeId ?? 0;

  const {
    targetId,
  }: {
    targetId?: number;
  } = req.body;

  if (userId === targetId) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.friend.addUserSelf,
    });
  }

  const targetUser = await client.user.findUnique({
    where: {
      id: targetId,
    },
  });
  if (!targetUser) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.user.userNotFound,
    });
  }

  if (targetUser.collegeId !== collegeId) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.friend.collegeNotMatched,
    });
  }

  if (targetId && !isFriend(userId, targetId)) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.class.noFriendWithTarget,
    });
  }

  const tokenUser = await client.user.findUnique({
    where: {
      id: targetId ?? userId,
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
}

export default withHandler({ methods: ["POST"], handler });
