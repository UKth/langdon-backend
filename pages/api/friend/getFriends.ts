import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  {
    userId,
  }: {
    userId: number;
  }
) {
  const friends = await client.friend.findMany({
    where: {
      OR: [
        {
          userId: userId,
        },
        {
          friendId: userId,
        },
      ],
    },
    include: {
      user: true,
      friend: true,
    },
  });

  const friendList = friends.map((friend) =>
    friend.userId == userId ? friend.friend : friend.user
  );

  return res.json({
    ok: true,
    friendsData: friendList,
  });
}

export default withHandler({ methods: ["POST"], handler });
