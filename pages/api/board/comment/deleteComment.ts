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
    commentId,
  }: {
    commentId?: number;
  } = req.body;

  const comment = await client.comment.findUnique({
    where: {
      id: commentId,
    },
  });

  if (comment?.userId !== userId) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.comment.deleteOthersComment });
  }
  const deletedComment = await client.comment.delete({
    where: {
      id: commentId,
    },
  });

  if (!deletedComment) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.comment.commentNotDeleted });
  }

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
