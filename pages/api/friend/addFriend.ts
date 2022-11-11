import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import {
  getNameString,
  isFriend,
  ResponseType,
  sendOnePush,
} from "@libs/server/util";

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
    targetId,
    code,
  }: {
    targetId: number;
    code: number;
  } = req.body;

  if (!userId) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.token.tokenNotMatched,
    });
  }

  const user = await client.user.findUnique({ where: { id: userId } });
  if (!user) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.user.userNotFound,
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

  const friendRequest = await client.friendRequest.findUnique({
    where: {
      createrId: targetId,
    },
  });

  if (!friendRequest || friendRequest.code !== code) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.friend.invalidRequest,
    });
  }

  const friend = await client.friend.create({
    data: {
      user: {
        connect: {
          id: targetId,
        },
      },
      friend: {
        connect: {
          id: userId,
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

  sendOnePush(targetUser.pushToken, {
    body: getNameString(user) + " adds you as a friend.",
  });

  await client.friendRequest.delete({
    where: {
      createrId: targetId,
    },
  });

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
