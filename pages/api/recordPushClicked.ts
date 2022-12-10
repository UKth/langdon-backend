import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";
import { errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";
import { ReportTargetType, User } from "@prisma/client";

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
    pushString,
  }: {
    pushString?: string;
  } = req.body;

  if (!pushString?.length) {
    return res.status(400).json({
      ok: false,
    });
  }

  const pushClickedRecord = await client.pushClicked.create({
    data: {
      userId: user.id,
      pushString: pushString,
    },
  });

  if (!pushClickedRecord) {
    return res.status(400).json({ ok: false });
  }

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
