import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType, sendCourseSignal } from "@libs/server/util";

import withHandler from "@libs/server/withHandler";
import { CourseForCrsSig, TermCode } from "@prisma/client";
import { TermCodes } from "@constants";

export type CourseForCrsSigWithUserCourse = CourseForCrsSig & {
  users: {
    email: string;
  }[];
  course: {
    courseDesignation: string;
    title: string;
  };
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    adminPassword,
    termCode,
  }: {
    adminPassword?: string;
    termCode?: TermCode;
  } = req.body;

  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(400).json({ ok: false });
  }

  if (!termCode || !TermCodes.includes(termCode)) {
    return res.status(400).json({ ok: false });
  }

  const courseSignal = await client.courseSignal.findUnique({
    where: {
      termCode,
    },
    include: {
      courseData: {
        include: {
          course: {
            select: {
              courseDesignation: true,
              title: true,
            },
          },
          users: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  if (!courseSignal) {
    return res.status(400).json({ ok: false });
  }

  const { courseData } = courseSignal;
  const mappedData: {
    [key: string]: CourseForCrsSigWithUserCourse[];
  } = {};

  for (let i = 0; i < courseData.length; i++) {
    const courseForCrsSig = courseData[i];
    for (let j = 0; j < courseForCrsSig.users.length; j++) {
      const { email } = courseForCrsSig.users[j];
      if (mappedData[email]) {
        mappedData[email].push(courseForCrsSig);
      } else {
        mappedData[email] = [courseForCrsSig];
      }
    }
  }

  const emails = Object.keys(mappedData);
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const courseForCrsSigs = mappedData[email];
    await sendCourseSignal({ address: email, courseForCrsSigs });
  }

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler, isPrivate: false });
