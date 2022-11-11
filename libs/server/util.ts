import client from "@libs/server/client";
import { User } from "@prisma/client";

export interface ResponseType {
  ok: boolean;
  [key: string]: any;
}

export const isFriend = async (userId: number, targetId: number) => {
  const friend = await client.friend.findMany({
    where: {
      OR: [
        {
          AND: [{ userId: userId }, { friendId: targetId }],
        },
        {
          AND: [{ userId: targetId }, { friendId: userId }],
        },
      ],
    },
    take: 1,
  });
  return !!friend.length;
};

export const validBoard = async (collegeId: number, boardId: number) => {
  const board = await client.board.findUnique({
    where: { id: boardId },
  });

  return board?.collegeId === collegeId;
};

export const validPost = async (collegeId: number, postId: number) => {
  const post = await client.post.findUnique({
    where: { id: postId },
    include: {
      board: {
        select: {
          collegeId: true,
        },
      },
      createdBy: {
        select: {
          pushToken: true,
        },
      },
    },
  });

  return post?.board?.collegeId === collegeId ? post : null;
};

export const handleDates = (body: any) => {
  if (body === null || body === undefined || typeof body !== "object")
    return body;

  for (const key of Object.keys(body)) {
    const value = body[key];
    if (value instanceof Date) body[key] = value.valueOf();
    else if (typeof value === "object") handleDates(value);
  }
  return body;
};

export type contentType = {
  body: string;
  badge?: number;
  title?: string;
  subtitle?: string;
  data?: any;
};

export const sendManyPush = (pushList: {
  pushToken: string;
  content: contentType;
}) => {};

export const sendOnePush = (pushToken: string, content: contentType) => {
  // TODO
  // let expo = new Expo();

  const message = {
    to: pushToken,
    sound: "default",
    title: "College Table",
    ...content,
  };

  console.log("body:", message);

  fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
};

export const getNameString = (user: User) => {
  return (
    user.firstName +
    " " +
    (user.middleName ? user.middleName + " " : "") +
    user.lastName
  );
};
