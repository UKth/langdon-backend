import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import {
  handleDates,
  ResponseType,
  whiteSpaceRemover,
} from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    courseId,
  }: {
    courseId?: number;
  } = req.body;

  if (!courseId) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.invalidParams });
  }

  const course = await client.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      classes: {
        include: {
          sections: {
            include: {
              classMeetings: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.course.courseNotFound });
  }

  return res.json({
    ok: true,
    course: handleDates(course),
  });
}

export default withHandler({ methods: ["POST"], handler });
