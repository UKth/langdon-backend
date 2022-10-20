import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

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

  const collegesData = await client.college.findMany({
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
  });

  return res.json({
    ok: true,
    collegesData,
  });
}

export default handler;
