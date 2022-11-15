import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";
import { errorMessages, termNames } from "@constants";
import withHandler from "@libs/server/withHandler";
import { TermCode, User } from "@prisma/client";

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
    termCode,
    title,
  }: {
    termCode?: TermCode;
    title?: string;
  } = req.body;

  if (!termCode || !Object.keys(TermCode).includes(termCode)) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.invalidParams });
  }

  if (!Object.keys(termNames).includes(termCode)) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.invalidParams });
  }

  const table = await client.table.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      termCode,
      title: title ?? termNames[termCode] ?? "Blank table",
      college: {
        connect: {
          id: collegeId,
        },
      },
    },
  });

  if (!table) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.table.tableNotCreated });
  }

  return res.json({
    ok: true,
    table,
  });
}

export default withHandler({ methods: ["POST"], handler });
