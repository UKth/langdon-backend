import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { isFriend, ResponseType } from "@libs/server/util";

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
  const userDetails = await client.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      posts: {
        take: 10,
      },
      comments: {
        take: 10,
      },
      likedPost: {
        take: 10,
      },
      likedComment: {
        take: 10,
      },
    },
  });

  if (!userDetails) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.user.userNotFound,
    });
  }

  return res.json({
    ok: true,
    userDetails,
  });
}

export default withHandler({ methods: ["POST"], handler });
