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
    query: { id },
  } = req;

  const {
    lastCommentId,
  }: {
    lastCommentId?: number;
  } = req.body;

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
      comments: {
        include: {
          createdBy: true,
        },
        orderBy: {
          id: "desc",
        },
        ...(lastCommentId
          ? {
              cursor: {
                id: lastCommentId,
              },
              skip: 1,
            }
          : {}),
        take: 30,
      },
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
    post: handleDates({
      ...post,
      ...(post.isAnonymous
        ? {
            createdBy: {
              id: post.createdBy.id,
            },
          }
        : {}),
    }),
    lastCommentId,
  });
}

export default withHandler({ methods: ["POST"], handler });
