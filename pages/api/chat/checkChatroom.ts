import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

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
    targetId?: number;
  } = req.body;

  if (!targetId) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.invalidParams });
  }

  const existingChatroom = await client.chatroom.findFirst({
    where: {
      AND: [
        { members: { some: { id: user.id } } },
        { members: { some: { id: targetId } } },
        { postId: null },
      ],
    },
  });

  return res.status(400).json({
    ok: true,
    chatroomId: existingChatroom?.id ?? null,
  });
}

export default withHandler({ methods: ["POST"], handler });
