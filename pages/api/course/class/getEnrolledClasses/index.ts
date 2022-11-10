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
  }: {
    userId: number;
  }
) {
  const {
    targetId,
  }: {
    targetId?: number;
  } = req.body;

  if (targetId && !(await isFriend(userId, targetId))) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.friend.noFriendWithTarget,
    });
  }

  const userDefaultTable = await client.table.findFirst({
    where: {
      defaultUser: {
        id: targetId ?? userId,
      },
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

  if (!userDefaultTable) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.table.defaultTableNotFound,
    });
  }

  return res.json({
    ok: true,
    enrolledClasses: userDefaultTable.enrolledClasses,
  });
}

export default withHandler({ methods: ["POST"], handler });
