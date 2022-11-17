import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import { ResponseType, sendMail } from "@libs/server/util";
import { emailRegex, errorMessages } from "@constants";
import withHandler from "@libs/server/withHandler";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const {
    email,
    name,
    pushToken,
  }: {
    email?: string;
    name?: string;
    pushToken?: string;
  } = req.body;

  if (!email?.length || !name?.length || !emailRegex.test(email)) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.invalidParams,
    });
  }

  const collegeSupportRequest = await client.collegeSupportRequest.create({
    data: {
      name,
      email,
      emailFooter: email.split("@")[1],
      pushToken: pushToken ?? "",
    },
  });

  if (!collegeSupportRequest) {
    return res.status(400).json({
      ok: false,
      error: errorMessages.collegeRequest.requestNotCreated,
    });
  }

  await sendMail({
    address: process.env.SUPPORT_EMAIL ?? "",
    subject: "College table - new college support request",
    mailhtml: `
    <h3>New college request</h3>
    <br>
    <h3>college name: ${name}</h3>
    <h3>email: ${email}</h3>
  `,
  });

  return res.json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler, isPrivate: false });
