import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import {
  errorMessages,
  JWT_TOKEN_EXPIRATION,
  VERIFICATION_TOKEN_EXPIRATION,
} from "@constants";
import jwt from "jsonwebtoken";

// mail.setApiKey(process.env.SENDGRID_KEY!);
// const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { keyword },
  } = req;

  if (Array.isArray(keyword)) {
    return res.status(400);
    // no message
  }

  const college = await client.college.findUnique({
    where: {
      mailFooter: "wisc.edu",
    },
  });

  if (!college) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.user.collegeForEmailNotExist });
  }

  const courseData = await client.course.findMany({
    where: {
      OR: [
        {
          courseDesignationCompressed: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          fullCourseDesignationCompressed: {
            contains: keyword,
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
    include: {
      classes: {
        include: {
          sections: true,
        },
      },
    },
  });

  return res.json({
    ok: true,
    courseData,
  });
}

export default handler;
