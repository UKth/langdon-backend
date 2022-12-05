import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType, sendManyPush, sendOnePush } from "@libs/server/util";

import withHandler from "@libs/server/withHandler";
import { User } from "@prisma/client";
import { DAY_TS } from "@constants";

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

  const newPost = await client.post.findFirst({
    select: {
      id: true,
      title: true,
    },
    where: {
      createdAt: {
        gt: new Date(Date.now() - 1 * DAY_TS),
        lt: new Date(),
      },
    },
    orderBy: {
      likedUsers: {
        _count: "desc",
      },
    },
  });

  console.log(newPost);
  if (newPost) {
    await sendManyPush(
      users.map((user) => ({
        pushToken: user.pushToken,
        content: {
          subtitle: "There's a new post yesterday.",
          body: newPost.title,
          data: {
            route: "Post",
            params: {
              id: newPost.id,
            },
          },
        },
      }))
    );
  }

  return res.json({
    ok: true,
    post: newPost,
  });
}

export default withHandler({ methods: ["POST"], handler, isPrivate: false });
