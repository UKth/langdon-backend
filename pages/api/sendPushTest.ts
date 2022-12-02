import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType, sendOnePush } from "@libs/server/util";

import withHandler from "@libs/server/withHandler";
import { User } from "@prisma/client";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    adminPassword,
  }: {
    adminPassword?: string;
  } = req.body;

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(400).json({ ok: false });
  }

  const users = await client.user.findMany({
    select: {
      id: true,
      pushToken: true,
    },
    take: 100,
  });

  const me = users[0];
  if (me.id !== 1) {
    return res.status(400).json({ ok: false });
  }

  await sendOnePush(me.pushToken, {
    body: "The most popular post of yesterday.",
    data: {
      route: "Post",
      params: {
        id: 1,
      },
    },
  });

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler, isPrivate: false });
