import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";
import { errorMessages, TermCodes } from "@constants";
import withHandler from "@libs/server/withHandler";
import { ReportTargetType, TermCode, User } from "@prisma/client";

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
    termCode,
  }: {
    termCode?: TermCode;
  } = req.body;

  if (!termCode || !TermCodes.includes(termCode)) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.courseSignal.invalidTermcode });
  }

  const courseSignal = await client.courseSignal.findFirst({
    where: {
      termCode,
    },
    include: {
      courseData: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!courseSignal) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.courseSignal.invalidTermcode });
  }
  console.log(courseSignal.courseData);

  const userData = await client.user.findUnique({
    where: { id: user.id },
    select: { defaultTableId: true },
  });

  if (!userData) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.user.userNotFound });
  }

  const table = await client.table.findUnique({
    where: { id: userData.defaultTableId },
    include: {
      enrolledClasses: {
        include: { course: true },
      },
    },
  });

  if (!table) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.table.tableNotFound });
  }

  const courses = table.enrolledClasses.map((cls) => cls.course);

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    let courseForCrsSig = await client.courseForCrsSig.findFirst({
      where: {
        courseSignalId: courseSignal.id,
        courseId: course.id,
      },
      include: {
        users: true,
      },
    });
    if (!courseForCrsSig) {
      courseForCrsSig = await client.courseForCrsSig.create({
        data: {
          course: {
            connect: {
              id: course.id,
            },
          },
          courseSignal: {
            connect: {
              id: courseSignal.id,
            },
          },
        },
        include: {
          users: true,
        },
      });
    }
    if (!courseForCrsSig) {
      return res
        .status(400)
        .json({ ok: false, error: errorMessages.table.tableNotFound });
    }
    await client.courseForCrsSig.update({
      where: {
        id: courseForCrsSig.id,
      },
      data: {
        users: {
          connect: { id: user.id },
        },
      },
    });
  }

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
