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
  }: {
    user: User;
  }
) {
  const {
    targetId,
  }: {
    targetId: number;
  } = req.body;

  if (!targetId) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.invalidParams,
    });
  }

  if (user.id === targetId) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.invalidParams,
    });
  }

  const friend = await client.friend.findFirst({
    where: {
      OR: [
        {
          AND: [{ userId: user.id }, { friendId: targetId }],
        },
        {
          AND: [{ userId: targetId }, { friendId: user.id }],
        },
      ],
    },
  });

  if (!friend) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.friend.deleteNotFriend,
    });
  }

  const deleteFriend = await client.friend.delete({
    where: {
      id: friend.id,
    },
  });

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
