import { atom } from "recoil";
type UserType = string | null;

export const User = atom<UserType>({
  key: "User",
  default: null,
});
