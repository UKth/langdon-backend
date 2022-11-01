import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import { ACCESS_TOKEN_EXPIRATION, errorMessages } from "@constants";
import jwt from "jsonwebtoken";
import withHandler, { TokenInterface } from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    refreshToken,
  }: {
    refreshToken: string;
  } = req.body;

  if (!refreshToken) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.token.refreshTokenRequired });
  }

  try {
    const {
      id: userId,
      expiration,
      collegeId,
      iat,
    } = jwt.verify(
      refreshToken,
      process.env.SECRET_KEY || ""
    ) as TokenInterface;

    if (expiration < new Date()) {
      return res.status(400).json({
        ok: false,
        error: errorMessages.token.refreshTokenExpired,
      });
    }

    const accessToken = jwt.sign(
      {
        id: userId,
        collegeId,
        expiration: Date.now() + ACCESS_TOKEN_EXPIRATION,
      },
      process.env.SECRET_KEY || ""
    );

    return res.json({
      ok: true,
      accessToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      error,
    });
  }
}

export default withHandler({ methods: ["POST"], handler, isPrivate: false });
