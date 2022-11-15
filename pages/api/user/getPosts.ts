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
  const posts = await client.post.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      id: "desc",
    },
    take: 30,
  });

  if (!posts) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.post.postsLoadFailed,
    });
  }

  return res.json({
    ok: true,
    posts,
  });
}

export default withHandler({ methods: ["POST"], handler });
