import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import {
  handleDates,
  ResponseType,
  validBoard,
  validPost,
} from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  {
    collegeId,
    lastId,
  }: {
    collegeId: number;
    lastId?: number;
  }
) {
  const {
    postId,
  }: {
    postId?: number;
  } = req.body;

  if (!postId || !validPost(collegeId, postId)) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.comment.invalidPost });
  }

  const comments = await client.comment.findMany({
    where: {
      postId,
    },
    include: {
      _count: {
        select: {
          likedUsers: true,
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
    comments: handleDates(comments),
    lastId,
  });
}

export default withHandler({ methods: ["POST"], handler });
