import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import { errorMessages } from "@constants";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";

export interface TokenInterface {
  id: number;
  collegeId: number;
  expiration: Date;
  iat: number;
}

const blankUser = {
  id: 0,
  netId: "",
  email: "",
  firstName: "",
  middleName: "",
  lastName: "",
  collegeId: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  defaultTableId: 0,
  pushToken: "",
};

type method = "GET" | "POST" | "DELETE";

interface ConfigType {
  methods: method[];
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    data: {
      user: User;
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
            error: errorMessages.token.tokenExpired,
            tokenExpired: true,
          });
        }

        const user = await client.user.findUnique({
          where: {
            id: userId,
          },
        });
        if (!user) {
          return res.status(400).json({
            ok: false,
            error: errorMessages.user.userNotFound,
          });
        }

        await handler(req, res, { user, collegeId });
      } else {
        console.error("Error: Something's wrong in withHandler.");
        await handler(req, res, { user: blankUser, collegeId: 0 });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error });
    }
  };
}
