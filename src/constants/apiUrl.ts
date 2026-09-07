export const SIGNUP_URL = "/api/users/sign_up";
export const SIGNIN_URL = "/api/users/sign_in";
export const SIGNOUT_URL = "/api/users/sign_out";
export const APPLIANCES_URL = "/api/appliances/";
export const RECOGNISE_URL = "/api/recognise";
export const PARTS_URL = (applianceId: string) =>
  `${APPLIANCES_URL}${applianceId}/parts/`;
