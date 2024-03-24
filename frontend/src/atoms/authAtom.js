import { atom } from 'recoil';

//state manager
const authScreenAtom = atom({
    key: 'authScreenAtom',
    default: 'login',
})

export default authScreenAtom;