import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { handleDates, ResponseType, validBoard } from "@libs/server/util";

import withHandler from "@libs/server/withHandler";
import { User } from "@prisma/client";
import { errorMessages } from "@constants";

export const targetUserProps = {
  id: true,
  netId: true,
  firstName: true,
  middleName: true,
  lastName: true,
};

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
    lastMessageId,
  }: {
    chatroomId?: number;
    lastMessageId?: number;
  } = req.body;

  const chatroom = await client.chatroom.findUnique({
    where: {
      id: chatroomId,
    },
    include: {
      members: {
        select: targetUserProps,
      },
      messages: {
        include: {
          user: {
            select: targetUserProps,
          },
        },
        orderBy: {
          id: "desc",
        },
        ...(lastMessageId
          ? {
              cursor: {
                id: lastMessageId,
              },
              skip: 1,
            }
          : {}),
        take: 30,
      },
      post: {
        select: {
          id: true,
          title: true,
          content: true,
        },
      },
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
    lastMessageId,
  });
}

export default withHandler({ methods: ["POST"], handler });
