import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType } from "@libs/server/util";

import {
  ACCESS_TOKEN_EXPIRATION,
  errorMessages,
  REFRESH_TOKEN_EXPIRATION,
  VERIFICATION_CODE_EXPIRATION,
} from "@constants";
import jwt from "jsonwebtoken";
import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    email,
    firstName,
    middleName,
    lastName,
    code,
    userId,
    pushToken: p_token,
  }: {
    email: string;
    code: number;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    userId?: number;
    pushToken?: string;
  } = req.body;

  const isTester =
    process.env.TESTER_EMAILS?.split(" ").includes(email) ?? false;

  const pushToken = p_token ?? "";

  const college = await client.college.findUnique({
    where: {
      mailFooter: email.split("@")[1],
    },
  });

  if (!college) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.user.collegeForEmailNotExist });
  }

  const foundCode = await client.verificationCode.findUnique({
    where: {
      email,
    },
  });

  if (!foundCode) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.user.codeForEmailNotExist });
  }

  if (!isTester && foundCode.code !== code) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.user.codeNotMatch });
  }

  if (
    Date.now() - foundCode.updatedAt.valueOf() >
    VERIFICATION_CODE_EXPIRATION + 5 * 1000
  ) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.user.codeExpired });
  }

  let user;

  if (userId) {
    user = await client.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        college: true,
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ ok: false, error: errorMessages.user.userNotFound });
    }

    await client.user.update({
      where: {
        id: user.id,
      },
      data: {
        pushToken,
      },
    });
  } else {
    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ ok: false, error: errorMessages.user.invalidUserCreateParams });
    }

    const emailUser = await client.user.findUnique({
      where: {
        email,
      },
    });

    if (emailUser) {
      return res.status(400).json({
        ok: false,
        error: errorMessages.user.userAlreadyExistForEmail,
      });
    }

    user = await client.user.create({
      data: {
        email,
        netId: email.split("@")[0],
        firstName,
        ...(middleName?.length ? { middleName } : {}),
        lastName,
        pushToken,
        college: {
          connect: {
            id: college.id,
          },
        },
        defaultTable: {
          create: {
            college: {
              connect: {
                id: college.id,
              },
            },
            termCode: +(process.env.CURRENT_TERM_CODE ?? ""),
          },
        },
      },
      include: {
        college: true,
      },
    });
  }

  if (!user) {
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.user.createUserFailed });
  }

  const updatedTable = await client.table.update({
    where: {
      id: user.defaultTableId,
    },
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  if (!updatedTable) {
    await client.user.delete({
      where: {
        id: user.id,
      },
    });
    return res
      .status(400)
      .json({ ok: false, error: errorMessages.table.connectUserFailed });
  }

  const accessToken = jwt.sign(
    {
      id: user.id,
      collegeId: college.id,
      expiration: Date.now() + ACCESS_TOKEN_EXPIRATION,
    },
    process.env.SECRET_KEY || ""
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
      collegeId: college.id,
      expiration: Date.now() + REFRESH_TOKEN_EXPIRATION,
    },
    process.env.SECRET_KEY || ""
  );

  await client.verificationCode.delete({
    where: {
      id: foundCode.id,
    },
  });

  return res.json({
    ok: true,
    accessToken,
    refreshToken,
    user,
  });
}

export default withHandler({ methods: ["POST"], handler, isPrivate: false });
