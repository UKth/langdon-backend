import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType, validBoard } from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  {
    collegeId,
    userId,
  }: {
    collegeId: number;
    userId: number;
  }
) {
  const {
    query: { id },
  } = req;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ ok: false, error: errorMessages.idRequired });
  }

  const post = await client.post.findUnique({
    where: {
      id: +id,
    },
    include: {
      board: {
        select: {
          collegeId: true,
        },
      },
      createdBy: true,
      comments: true,
      _count: {
        select: {
          likedUsers: true,
          comments: true,
        },
      },
    },
  });
  if (post?.board.collegeId !== collegeId) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.post.getPostInvalidBoard });
  }
  if (!post) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.post.postNotFound });
  }

  return res.json({
    ok: true,
    post,
  });
}

export default withHandler({ methods: ["POST"], handler });
