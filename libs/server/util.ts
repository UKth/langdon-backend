import client from "@libs/server/client";
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
    },
  });

  return post?.board?.collegeId === collegeId;
};
