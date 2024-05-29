import { atom } from "recoil";
type UserType = any

const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
const userIdCookie = cookies.find((cookie) => cookie.startsWith("token="));

export const User = atom<UserType>({
  key: "User",
  default: userIdCookie,
});
