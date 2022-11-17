import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { handleDates, ResponseType, validBoard } from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  {
    collegeId,
  }: {
    collegeId: number;
  }
) {
  const {
    boardId,
    lastId,
  }: {
    boardId?: number;
    lastId?: number;
  } = req.body;

  // if (!boardId || !validBoard(collegeId, boardId)) {
  //   return res
  //     .status(400)
  //     .json({ ok: false, error: errorMessages.post.getPostInvalidBoard });
  // }

  const posts = await client.post.findMany({
    where: {
      boardId,
    },
    include: {
      _count: {
        select: {
          likedUsers: true,
          comments: true,
        },
      },
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

  return res.json({
    ok: true,
    posts: handleDates(posts),
    lastId,
  });
}

export default withHandler({ methods: ["POST"], handler });
