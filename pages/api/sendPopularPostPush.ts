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

  const popularPost = await client.post.findFirst({
    select: {
      id: true,
      title: true,
    },
    where: {
      createdAt: {
        gt: new Date(Date.now() - 10 * DAY_TS),
        lt: new Date(),
      },
    },
    orderBy: {
      likedUsers: {
        _count: "desc",
      },
    },
  });

  console.log(popularPost);
  if (popularPost) {
    await sendManyPush(
      users.map((user) => ({
        pushToken: user.pushToken,
        content: {
          subtitle: "The most popular post of yesterday.",
          body: popularPost.title,
          data: {
            route: "Post",
            params: {
              id: popularPost.id,
            },
          },
        },
      }))
    );
  }

  return res.json({
    ok: true,
    post: popularPost,
  });
}

export default withHandler({ methods: ["POST"], handler, isPrivate: false });
