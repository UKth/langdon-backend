import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType, whiteSpaceRemover } from "@libs/server/util";

import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>,
  {
    collegeId,
  }: {
    collegeId: number;
  }
) {
  const {
    keyword: rawKeyword,
  }: {
    keyword?: string;
  } = req.body;
  const keyword = rawKeyword?.trim().toLowerCase();

  if (!keyword?.length) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.course.keywordNotProvided });
  }

  const college = await client.college.findUnique({
    where: {
      id: collegeId,
    },
  });

  if (!college) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.college.collegeNotFound });
  }

  const courses = await client.course.findMany({
    where: {
      AND: [
        { collegeId: college.id },
        {
          OR: [
            {
              courseDesignationCompressed: {
                contains: whiteSpaceRemover(keyword),
                mode: "insensitive",
              },
            },
            {
              fullCourseDesignationCompressed: {
                contains: whiteSpaceRemover(keyword),
                mode: "insensitive",
              },
            },
            {
              title: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          ],
        },
      ],
    },
    include: {
      classes: {
        include: {
          sections: true,
        },
      },
    },
    take: 30,
  });

  console.log(courses);

  return res.json({
    ok: true,
    courses,
  });
}

export default withHandler({ methods: ["POST"], handler });
