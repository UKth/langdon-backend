import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import {
  errorMessages,
  MIN_CONTENT_LENGTH,
  MIN_TITLE_LENGTH,
} from "@constants";
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
  });

  if (!course) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.course.courseNotFound });
  }

  if (course.boardId) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.course.boardAlreadyExist });
  }

  const board = await client.board.create({
    data: {
      createdBy: {
        connect: {
          id: user.id,
        },
      },
      type: "course",
      course: {
        connect: {
          id: course.id,
        },
      },
      title: course.title,
      college: {
        connect: {
          id: collegeId,
        },
      },
    },
  });

  if (!board) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.board.boardNotCreated });
  }

  return res.json({
    ok: true,
    board,
  });
}

export default withHandler({ methods: ["POST"], handler });
