import { atom } from 'recoil';

//atom for managing post state
const postsAtom = atom({
    key: "postsAtom",
    default: [],
});

export default postsAtom;

