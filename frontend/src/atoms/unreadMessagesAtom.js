
import { atom } from "recoil";

export const unreadMessagesAtom = atom({
    key: "unreadMessages",
    default: [],
});
