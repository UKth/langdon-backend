import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";
import { Course } from "@prisma/client";

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
    userId,
    collegeId,
  }: {
    userId: number;
    collegeId: number;
  }
) {
  const {
    classId,
  }: {
    classId: number;
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

  const tokenUser = await client.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      enrolledClasses: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!tokenUser) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.user.userNotFound,
    });
  }

  if (
    includeCourse(
      tokenUser.enrolledClasses.map((enrolledClass) => enrolledClass.course),
      cls.courseId
    )
  ) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.course.alreadyEnrolledClass,
    });
  }

  const updatedUser = await client.user.update({
    where: {
      id: tokenUser.id,
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
  console.log(updatedUser);
  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
