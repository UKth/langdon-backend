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
  const {
    tableId,
  }: {
    tableId?: number;
  } = req.body;

  if (tableId) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.invalidParams,
    });
  }

  const table = await client.table.findFirst({
    where: {
      id: tableId,
      userId: user.id,
    },
  });

  if (!table) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.table.tableNotFound,
    });
  }

  const deletedTable = await client.table.delete({ where: { id: table.id } });

  if (!deletedTable) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.table.tableDeletionFailed,
    });
  }

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
