const min_ts = 60 * 1000;
export const VERIFICATION_TOKEN_EXPIRATION = 3 * min_ts;
export const ACCESS_TOKEN_EXPIRATION = 1 * 60 * min_ts;
export const REFRESH_TOKEN_EXPIRATION = 30 * 24 * 60 * min_ts; // 30days
export const REFRESH_TOKEN_RENEWAL = 10 * 24 * min_ts; // 10days

export const errorMessages = {
  user: {
    emailNotRecieved: "Email is required.",
    collegeForEmailNotExist: "Can't find college of the email footer.",
    tokenNotCreated: "Token not created. Please try again.",
    tokenForEmailNotExist: "Token not found.",
    tokenExpired: "Token has been expired. Please try again.", //
    tokenNotMatch: "Wrong token value.",
    createUserFailed: "Can't register user. Please try again.",
  },
};

export const EXAMDATE_OFFSET = 1670750000000; // why??
