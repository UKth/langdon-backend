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
    targetId,
    tableId,
  }: {
    targetId?: number;
    tableId?: number;
  } = req.body;

  if (targetId && !(await isFriend(user.id, targetId))) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.friend.noFriendWithTarget,
    });
  }
  const targetUserId = targetId ?? user.id;

  const table = await client.table.findFirst({
    where: {
      ...(tableId
        ? { AND: [{ id: tableId }, { userId: targetUserId }] }
        : {
            defaultUser: {
              id: targetUserId,
            },
          }),
    },
    include: {
      enrolledClasses: {
        include: {
          course: true,
          sections: {
            include: {
              classMeetings: {
                include: {
                  building: true,
                },
              },
              instructor: true,
            },
          },
        },
      },
    },
  });

  if (!table) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.table.tableNotFound,
    });
  }

  return res.json({
    ok: true,
    table,
  });
}

export default withHandler({ methods: ["POST"], handler });
