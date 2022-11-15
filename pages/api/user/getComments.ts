import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

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
  const comments = await client.comment.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      id: "desc",
    },
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
    comments,
  });
}

export default withHandler({ methods: ["POST"], handler });
