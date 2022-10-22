const min_ts = 60 * 1000;
export const VERIFICATION_CODE_EXPIRATION = 3 * min_ts;
export const ACCESS_TOKEN_EXPIRATION = 1 * 60 * min_ts;
export const REFRESH_TOKEN_EXPIRATION = 30 * 24 * 60 * min_ts; // 30days
export const REFRESH_TOKEN_RENEWAL = 10 * 24 * min_ts; // 10days

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
    invalidToken: "Invalid token.",
    tokenNotMatched: "Invalid token for user.",
    tokenExpired: "Token Expired.",
    classNotFound: "Class not found.",
    invalidClass: "Invalid class.",
    notEnrolledClass: "The user didn't enrolled the class.",
  },
};

export const EXAMDATE_OFFSET = 1670750000000; // why??
