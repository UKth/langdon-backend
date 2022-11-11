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
    collegeId,
  }: {
    user: User;
    collegeId: number;
  }
) {
  const code = Math.floor(100000 + Math.random() * 900000);

  const request = await client.friendRequest.findUnique({
    where: {
      createrId: user.id,
    },
  });
  if (request) {
    const updateFriendRequest = await client.friendRequest.update({
      where: {
        createrId: user.id,
      },
      data: {
        code,
      },
    });

    if (!updateFriendRequest) {
      return res.status(400).json({
        ok: false,
        error: errorMessages.friend.createFriendRequestFailed,
      });
    }
  } else {
    const friendRequest = await client.friendRequest.create({
      data: {
        createrId: user.id,
        code,
      },
    });
    if (!friendRequest) {
      return res.status(400).json({
        ok: false,
        error: errorMessages.friend.createFriendRequestFailed,
      });
    }
  }

  return res.json({
    ok: true,
    code,
  });
}
export default withHandler({ methods: ["POST"], handler });
