import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { handleDates, ResponseType, validBoard } from "@libs/server/util";

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
    lastId,
  }: {
    lastId?: number;
  } = req.body;

  const chatrooms = await client.chatroom.findMany({
    where: {
      members: {
        some: {
          id: user.id,
        },
      },
    },
    include: {
      lastMessage: true,
    },
    orderBy: {
      id: "desc",
    },
    ...(lastId
      ? {
          cursor: {
            id: lastId,
          },
          skip: 1,
        }
      : {}),
    take: 30,
  });

  return res.json({
    ok: true,
    chatrooms: handleDates(chatrooms),
  });
}

export default withHandler({ methods: ["POST"], handler });
