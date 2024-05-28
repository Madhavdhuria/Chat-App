import { atom } from "recoil";
type UserType = string | null;

const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
const userIdCookie = cookies.find((cookie) => cookie.startsWith("userId="));
export const User = atom<UserType>({
  key: "User",
  default: userIdCookie,
});
