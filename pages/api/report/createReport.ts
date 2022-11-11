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
    content = "",
    targetId,
    targetType,
  }: {
    content: string;
    targetId: number;
    targetType: ReportTargetType;
  } = req.body;

  if (!targetId || !targetType) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.report.invalidCreateReportParams,
    });
  }

  const report = await client.report.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      content,
      targetType,
      targetId,
    },
  });

  if (!report) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.report.reportNotCreated });
  }

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler });
