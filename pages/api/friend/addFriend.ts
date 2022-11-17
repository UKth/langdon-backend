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
import { User } from "@prisma/client";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  {
    user,
    collegeId,
  }: {
    user: User;
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

  if (!targetId) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.friend.addNoTargetId,
    });
  }

  if (user.id === targetId) {
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

  if (await isFriend(user.id, targetId)) {
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
          id: user.id,
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

  await sendOnePush(targetUser.pushToken, {
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
