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
    targetId: number;
  } = req.body;

  if (!userId) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.user.tokenNotMatched,
    });
  }

  if (!targetId) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.friend.addNoTargetId,
    });
  }

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

  if (await isFriend(userId, targetId)) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.friend.alreadyFriend,
    });
  }

  const friend = await client.friend.create({
    data: {
      user: {
        connect: {
          id: userId,
        },
      },
      friend: {
        connect: {
          id: targetId,
        },
      },
    },
  });

  if (!friend) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.friend.addFriendFailed,
    });
  }

  return res.json({
    ok: true,
  });
}
export default withHandler({ methods: ["POST"], handler });
