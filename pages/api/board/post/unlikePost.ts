import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType, sendOnePush, validPost } from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";
import { User } from "@prisma/client";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  {
    user,
    collegeId,
  }: {
    user: User;
    collegeId: number;
  }
) {
  const {
    postId,
  }: {
    postId?: number;
  } = req.body;

  if (!postId) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.invalidParams });
  }

  const post = await validPost(collegeId, postId);

  if (!post) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.invalidParams });
  }

  const updatedPost = await client.post.update({
    where: {
      id: post.id,
    },
    data: {
      likedUsers: {
        disconnect: {
          id: user.id,
        },
      },
    },
    include: {
      _count: {
        select: {
          likedUsers: true,
        },
      },
    },
  });

  if (!updatedPost) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.post.unlikeFailed,
    });
  }

  return res.json({
    ok: true,
    count: {
      likedUser: updatedPost._count.likedUsers,
    },
  });
}

export default withHandler({ methods: ["POST"], handler });
