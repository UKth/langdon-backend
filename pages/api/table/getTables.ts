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
  const tables = await client.table.findMany({
    where: {
      userId: user.id,
    },
  });

  if (!tables) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.table.tableNotFound,
    });
  }

  return res.json({
    ok: true,
    tables: handleDates(tables),
  });
}

export default withHandler({ methods: ["POST"], handler });
