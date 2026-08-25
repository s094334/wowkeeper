export const SIGNUP_URL = "/api/users/sign_up";
export const SIGNIN_URL = "/api/users/sign_in";
export const SIGNOUT_URL = "/api/users/sign_out";
export const APPLIANCES_URL = "/api/appliances/";

/** 耗材掛在家電底下。集合網址的結尾斜線一樣不能省，單筆是再接 partId。 */
export const partsUrl = (applianceId: string) =>
  `${APPLIANCES_URL}${applianceId}/parts/`;
