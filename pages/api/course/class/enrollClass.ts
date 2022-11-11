import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";
import { Course, User } from "@prisma/client";

const includeCourse = (courses: Course[], id: number) => {
  for (let i = 0; i < courses.length; i++) {
    if (courses[i].id === id) {
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
    collegeId,
  }: {
    user: User;
    collegeId: number;
  }
) {
  const {
    classId,
    tableId: t_id,
  }: {
    classId: number;
    tableId?: number;
  } = req.body;

  const cls = await client.class.findUnique({
    where: { id: classId },
    include: {
      course: true,
    },
  });

  if (!cls) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.class.classNotFound,
    });
  }

  if (cls.course.collegeId !== collegeId) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.class.invalidClass,
    });
  }

  const tableId = t_id ?? user.defaultTableId;

  const table = await client.table.findFirst({
    where: {
      id: tableId,
      userId: user.id,
    },
    include: {
      enrolledClasses: {
        include: {
          course: true,
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

  if (
    includeCourse(
      table.enrolledClasses.map((enrolledClass) => enrolledClass.course),
      cls.courseId
    )
  ) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.course.alreadyEnrolledCoure,
    });
  }

  const updatedTable = await client.table.update({
    where: {
      id: table.id,
    },
    data: {
      enrolledClasses: {
        connect: {
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
