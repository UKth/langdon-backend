import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  {
    userId,
  }: {
    userId: number;
  }
) {
  const {
    postId,
  }: {
    postId?: number;
  } = req.body;

  const post = await client.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (post?.userId !== userId) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.post.deleteOthersPost });
  }
  const deletedPost = await client.post.delete({
    where: {
      id: postId,
    },
  });

  if (!deletedPost) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.post.postNotDeleted });
  }

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
