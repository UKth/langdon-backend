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

  const comments = await client.comment.findMany({
    where: {
      userId: user.id,
    },
    include: {
      _count: {
        select: {
          likedUsers: true,
        },
      },
      post: true,

      createdBy: {
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
  });

  if (!comments) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.comment.commentsLoadFailed,
    });
  }

  return res.json({
    ok: true,
    comments: handleDates(comments),
  });
}

export default withHandler({ methods: ["POST"], handler });
