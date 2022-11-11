import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import {
  handleDates,
  ResponseType,
  sendOnePush,
  validBoard,
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
    postId,
    content,
  }: {
    targetId?: number;
    postId?: number;
    content?: string;
  } = req.body;

  if (!targetId || !content?.length) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.invalidParams });
  }

  const existingChatroom = await client.chatroom.findFirst({
    where: {
      AND: [
        { members: { some: { id: user.id } } },
        { members: { some: { id: targetId } } },
        ...(postId ? [{ postId }] : []),
      ],
    },
  });

  if (existingChatroom) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.chatroom.alreadyExistingChatroom,
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

  const message = await client.message.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      content,
    },
  });

  const post = postId
    ? await client.post.findUnique({ where: { id: postId } })
    : null;

  const chatroom = await client.chatroom.create({
    data: {
      members: {
        connect: [{ id: user.id }, { id: targetUser.id }],
      },
      lastMessage: { connect: { id: message.id } },
      ...(post
        ? {
            post: { connect: { id: post.id } },
          }
        : {}),
      messages: {
        connect: {
          id: message.id,
        },
      },
    },
  });

  sendOnePush(targetUser.pushToken, {
    body: "Someone sent you a message.",
    data: {
      route: "Chatrooms",
    },
  });

  return res.json({
    ok: true,
    chatroom: handleDates(chatroom),
  });
}

export default withHandler({ methods: ["POST"], handler });
