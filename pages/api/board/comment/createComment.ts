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
    content,
    isAnonymous = true,
  }: {
    postId?: number;
    content?: string;
    isAnonymous?: boolean;
  } = req.body;

  if (!postId || !content?.length) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.post.paramsNotEnough });
  }

  const post = await validPost(collegeId, postId);

  if (!postId || !post) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.comment.invalidPost });
  }

  const comment = await client.comment.create({
    data: {
      createdBy: {
        connect: {
          id: user.id,
        },
      },
      content,
      isAnonymous,
      post: {
        connect: {
          id: postId,
        },
      },
    },
  });

  if (!comment) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.comment.commentNotCreated,
    });
  }

  sendOnePush(post.createdBy.pushToken, {
    body: "Someone created comment on your post.",
    data: {
      route: "Post",
      params: {
        id: post.id,
      },
    },
  });

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
