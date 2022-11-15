import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { handleDates, isFriend, ResponseType } from "@libs/server/util";

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
  const newUser = await client.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      college: true,
    },
  });

  if (!newUser) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.user.userNotFound,
    });
  }

  return res.json({
    ok: true,
    user: handleDates(newUser),
  });
}

export default withHandler({ methods: ["POST"], handler });
