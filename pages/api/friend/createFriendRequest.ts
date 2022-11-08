import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { isFriend, ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";
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
  if (!userId) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.token.tokenNotMatched,
    });
  }

  const code = Math.floor(100000 + Math.random() * 900000);

  const friendRequest = await client.friendRequest.create({
    data: {
      createrId: userId,
      code,
    },
  });

  if (!friendRequest) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.friend.createFriendRequestFailed,
    });
  }

  return res.json({
    ok: true,
    code,
  });
}
export default withHandler({ methods: ["POST"], handler });
