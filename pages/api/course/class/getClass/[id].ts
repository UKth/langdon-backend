import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";
import jwt from "jsonwebtoken";
import withHandler from "@libs/server/withHandler";

// mail.setApiKey(process.env.SENDGRID_KEY!);
// const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    query: { id },
  } = req;

  if (!id || Array.isArray(id)) {
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

  const classData = await client.class.findUnique({
    where: {
      id: +id,
    },
    include: {
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
  });

  return res.json({
    ok: true,
    classData,
  });
}

export default withHandler({ methods: ["GET"], handler, isPrivate: false });
