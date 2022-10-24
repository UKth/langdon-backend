import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  userId?: number
) {
  const {
    targetId,
  }: {
    targetId: number;
  } = req.body;
  if (!targetId) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.friend.addNoTargetId,
    });
  }

  const oldFriend = await client.friend.findMany({
    where: {
      OR: [
        {
          AND: [{ userId: userId }, { friendId: targetId }],
        },
        {
          AND: [{ userId: targetId }, { friendId: userId }],
        },
      ],
    },
  });

  if (oldFriend) {
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
