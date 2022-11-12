import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { handleDates, ResponseType, validBoard } from "@libs/server/util";

import withHandler from "@libs/server/withHandler";
import { User } from "@prisma/client";
import { errorMessages } from "@constants";

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
    chatroomId,
    lastId,
  }: {
    chatroomId?: number;
    lastId?: number;
  } = req.body;

  const chatroom = await client.chatroom.findUnique({
    where: {
      id: chatroomId,
    },
    include: {
      members: {
        select: { id: true },
      },
      messages: {
        include: {
          user: {
            select: {
              id: true,
              netId: true,
            },
          },
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
      },
      post: true,
    },
  });

  if (!chatroom) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.chatroom.chatroomNotFound });
  }

  if (!chatroom.members.map((member) => member.id).includes(user.id)) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.chatroom.notMember });
  }

  return res.json({
    ok: true,
    chatroom: handleDates(chatroom),
  });
}

export default withHandler({ methods: ["POST"], handler });
