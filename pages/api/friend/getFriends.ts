import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { handleDates, ResponseType } from "@libs/server/util";

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
  const friends = await client.friend.findMany({
    where: {
      OR: [
        {
          userId: user.id,
        },
        {
          friendId: user.id,
        },
      ],
    },
    include: {
      user: true,
      friend: true,
    },
    take: 100,
  });

  const friendList = friends.map((friend) =>
    friend.userId === user.id ? friend.friend : friend.user
  );

  return res.json({
    ok: true,
    friendsData: handleDates(
      friendList.map((user) => ({
        ...user,
        pushToken: "",
      }))
    ),
  });
}

export default withHandler({ methods: ["POST"], handler });
