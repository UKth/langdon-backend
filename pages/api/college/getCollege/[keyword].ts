import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";
import withHandler from "@libs/server/withHandler";

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

  const collegeData = await client.college.findMany({
    where: {
      OR: [
        {
          name: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          mailFooter: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      ],
    },
    take: 30,
  });

  return res.json({
    ok: true,
    collegeData,
  });
}

export default withHandler({ methods: ["GET"], handler, isPrivate: false });
