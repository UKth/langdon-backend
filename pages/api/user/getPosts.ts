import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { handleDates, ResponseType } from "@libs/server/util";

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
    lastId,
  }: {
    lastId?: number;
  } = req.body;

  const posts = await client.post.findMany({
    where: {
      userId: user.id,
    },
    include: {
      _count: {
        select: {
          likedUsers: true,
          comments: true,
        },
      },
      board: true,
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

  if (!posts) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.post.postsLoadFailed,
    });
  }

  return res.json({
    ok: true,
    posts: handleDates(posts),
  });
}

export default withHandler({ methods: ["POST"], handler });
