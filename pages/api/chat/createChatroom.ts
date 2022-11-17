import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { handleDates, ResponseType, sendMessagePush } from "@libs/server/util";

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
    isAnonymous: isAnon,
  }: {
    targetId?: number;
    postId?: number;
    content?: string;
    isAnonymous?: boolean;
  } = req.body;
  const isAnonymous = isAnon === undefined ? true : isAnon;
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
      existingChatroom: handleDates(existingChatroom),
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
      isAnonymous,
    },
  });

  await sendMessagePush(targetUser.pushToken, content);

  return res.json({
    ok: true,
    chatroom: handleDates(chatroom),
  });
}

export default withHandler({ methods: ["POST"], handler });
