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

  const updatedUser = await client.user.update({
    where: { id: user.id },
    data: {
      defaultTable: {
        connect: {
          id: table.id,
        },
      },
    },
  });

  if (!updatedUser) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.table.tableSetDefaultFailed,
    });
  }

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
