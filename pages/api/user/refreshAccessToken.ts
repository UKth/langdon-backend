import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import {
  ACCESS_TOKEN_EXPIRATION,
  errorMessages,
  REFRESH_TOKEN_EXPIRATION,
  REFRESH_TOKEN_RENEWAL,
} from "@constants";
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

    let newRefreshToken;
    if (expiration.valueOf() - new Date().valueOf() < REFRESH_TOKEN_RENEWAL) {
      newRefreshToken = jwt.sign(
        {
          id: userId,
          collegeId,
          expiration: Date.now() + REFRESH_TOKEN_EXPIRATION,
        },
        process.env.SECRET_KEY || ""
      );
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
      ...(refreshToken ? { refreshToken: newRefreshToken } : {}),
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
