export const MIN_TS = 60 * 1000;
export const HOUR_TS = 60 * MIN_TS;
export const DAY_TS = 24 * HOUR_TS;
export const VERIFICATION_CODE_EXPIRATION = 3 * MIN_TS;
export const ACCESS_TOKEN_EXPIRATION = 1 * HOUR_TS;
export const REFRESH_TOKEN_EXPIRATION = 30 * DAY_TS; // 30days
export const REFRESH_TOKEN_RENEWAL = 10 * DAY_TS; // 10days

export const SUPPORT_EMAIL = "collegetable.dev@gmail.com";

export const emailRegex = /^[\w-\.]+@[\w-\.]+/;

export const MIN_TITLE_LENGTH = 3;
export const MIN_CONTENT_LENGTH = 3;

export const EXPO_PUSH_API_URL = "https://exp.host/--/api/v2/push/send";

export const termNames = {
  T_1232: "Fall 2022",
  T_1234: "Spring 2023",
};

export const errorMessages = {
  user: {
    emailNotRecieved: "Email is required.",
    collegeForEmailNotExist: "Can't find college of the email footer.",
    codeNotCreated: "Code not created. Please try again.",
    codeForEmailNotExist: "Code not found.",
    codeExpired: "Code has been expired. Please try again.", //
    codeNotMatch: "Wrong code value.",
    invalidUserCreateParams: "First name, last name, and email is required.",
    createUserFailed: "Can't register user. Please try again.",
    userNotFound: "Can't find user",
    userAlreadyExistForEmail: "User already exist. Please try again.",
  },
  college: {
    collegeNotFound: "College not found.",
  },
  table: {
    defaultTableNotFound: "Can't find table of the user.",
    tableNotFound: "Can't find the table.",
    connectUserFailed:
      "Failed to generating table. Please contact to support address.",
    invalidTermcodeClass: "The class is not for this semester.",
    tableNotCreated: "Table not created. Please try again.",
    tableDeletionFailed: "Can't delete the table. Please try again.",
    tableSetDefaultFailed:
      "Can't delete the table as a public table. Please try again.",
  },
  token: {
    invalidToken: "Invalid token.",
    tokenNotMatched: "Invalid token for user.",
    tokenExpired: "Token Expired.",
    refreshTokenRequired: "Refresh token is required.",
    refreshTokenExpired: "Refresh token Expired. Please login again.",
  },
  course: {
    alreadyEnrolledCoure: "You can't enroll two section of one class.",
    keywordNotProvided: "You need to enter a search keyword.",
    courseNotFound: "Can't find the course.",
    boardAlreadyExist: "Invalid request. Please try again.",
  },
  friend: {
    addNoTargetId: "Target value is required.",
    alreadyFriend: "You're already friend with target user.",
    createFriendRequestFailed:
      "Failed to create friend request. Please try again.",
    addFriendFailed: "Failed to add friend. Please try again.",
    addUserSelf: "You can't be a friend with yourself.",
    collegeNotMatched: "You can only be a friend with same college's user.",
    invalidRequest: "The link is invalid. Please try again.",
    noFriendWithTarget: "You can only get your friend's classes.",
    deleteNotFriend: "You're not friend with the user.",
  },
  class: {
    classNotFound: "Class not found.",
    invalidClass: "Invalid class.",
    notEnrolledClass: "The user didn't enrolled the class.",
    enrollFailed: "Add failed. Please try again.",
    dropFailed: "Delete failed. Please try again.",
  },
  post: {
    boardIdRequired: "Board id is required.",
    getPostInvalidBoard: "You can't get posts of the board.",
    paramsNotEnough: "All field is required.",
    postNotCreated: "Post not created. Please try again.",
    postNotFound: "Post not found. Please try again.",
    deleteOthersPost: "You can only delete your post.",
    postNotDeleted: "Post not deleted. Please try again.",
    updateOthersPost: "You can only update your post.",
    postNotUpdated: "Post not updated. Please try again.",
    postsLoadFailed: "Failed to get posts. Please try again.",
    likeFailed: "Failed to like post.",
    unlikeFailed: "Failed to unlike post.",
  },
  comment: {
    invalidPost: "You can't write a comment in the post.",
    commentNotCreated: "Comment not created. Please try again.",
    deleteOthersComment: "You can only delete your comment.",
    commentNotDeleted: "Comment not deleted. Please try again.",
    commentsLoadFailed: "Failed to get comments. Please try again.",
  },
  chatroom: {
    chatroomNotFound: "Can't find chatroom.",
    notMember: "You're not a member of the room.",
    membersNotTwo:
      "Something's wrong in data. Please contact via " + SUPPORT_EMAIL,
    alreadyExistingChatroom: "You already sent message to the writer.",
  },
  board: {
    boardNotCreated: "Failed to create new board. Please try again.",
  },
  report: {
    invalidCreateReportParams: "Target, type is required",
    reportNotCreated: "Report not created. Please try again.",
  },
  collegeRequest: {
    requestNotCreated: "Request not sent. Please try again.",
  },
  idRequired: "Id required.",
  loginRequired: "Login required.",
  invalidParams: "Invalid parameters.",
};
