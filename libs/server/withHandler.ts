import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";
import jwt from "jsonwebtoken";

interface TokenInterface {
  id: number;
  collegeId: number;
  expiration: Date;
  iat: number;
}

type method = "GET" | "POST" | "DELETE";

interface ConfigType {
  methods: method[];
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    data: {
      userId: number;
      collegeId: number;
    }
  ) => void;
  isPrivate?: boolean;
}

export default function withHandler({
  methods,
  isPrivate = true,
  handler,
}: ConfigType) {
  return async function (
    req: NextApiRequest,
    res: NextApiResponse
  ): Promise<any> {
    if (req.method && !methods.includes(req.method as any)) {
      return res.status(405).end();
    }
    try {
      if (isPrivate) {
        const {
          accessToken,
        }: {
          accessToken: string;
        } = req.body;

        const {
          id: userId,
          expiration,
          collegeId,
          iat,
        } = jwt.verify(
          accessToken,
          process.env.SECRET_KEY || ""
        ) as TokenInterface;

        if (expiration < new Date()) {
          return res.status(400).json({
            ok: false,
            error: errorMessages.user.tokenExpired,
            tokenExpired: true, // temporary
          });
        }

        await handler(req, res, { userId, collegeId });
      } else {
        await handler(req, res, { userId: 0, collegeId: 0 });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  };
}
