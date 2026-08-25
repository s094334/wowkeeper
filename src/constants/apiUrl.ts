export const SIGNUP_URL = "/api/users/sign_up";
export const SIGNIN_URL = "/api/users/sign_in";
export const SIGNOUT_URL = "/api/users/sign_out";
export const APPLIANCES_URL = "/api/appliances/";
export const partsUrl = (applianceId: string) =>
  `${APPLIANCES_URL}${applianceId}/parts/`;
