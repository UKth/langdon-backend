import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import {
  errorMessages,
  MIN_CONTENT_LENGTH,
  MIN_TITLE_LENGTH,
} from "@constants";
import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  {
    userId,
    collegeId,
  }: {
    userId: number;
    collegeId: number;
  }
) {
  const {
    postId,
    title,
    content,
  }: {
    postId?: number;
    title?: string;
    content?: string;
  } = req.body;

  const post = await client.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (post?.userId !== userId) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.post.updateOthersPost });
  }

  const updatedPost = await client.post.update({
    where: {
      id: postId,
    },
    data: {
      title,
      content,
    },
  });

  if (!updatedPost) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.post.postNotDeleted });
  }

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
