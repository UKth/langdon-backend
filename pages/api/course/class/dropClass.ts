import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";

import { Class, User } from "@prisma/client";
import withHandler from "@libs/server/withHandler";

const includeClass = (classes: Class[], id: number) => {
  for (let i = 0; i < classes.length; i++) {
    if (classes[i].id === id) {
      return true;
    }
  }
  return false;
};

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
    classId,
    tableId,
  }: {
    classId?: number;
    tableId?: number;
  } = req.body;

  if (!classId || !tableId) {
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
    include: {
      enrolledClasses: true,
    },
  });

  if (!table) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.table.tableNotFound,
    });
  }

  if (!includeClass(table.enrolledClasses, classId)) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.class.notEnrolledClass,
    });
  }

  const updatedTable = await client.table.update({
    where: {
      id: table.id,
    },
    data: {
      enrolledClasses: {
        disconnect: {
          id: classId,
        },
      },
    },
    include: {
      enrolledClasses: true,
    },
  });

  if (!updatedTable) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.class.enrollFailed,
    });
  }

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
