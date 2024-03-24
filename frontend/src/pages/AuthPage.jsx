import { useRecoilValue } from "recoil";
import LoginCard from "../components/LoginCard";
import SignupCard from "../components/SignupCard";
import authScreenAtom from "../atoms/authAtom";

//Getting the value of the state from recoil
//If it is login shows the login card component else shows the signup card
const AuthPage = () => {
    //This works like useState, below is how we can get the "xxx" from [xxx,setXXX]. 
    const authScreenState = useRecoilValue(authScreenAtom);

    return <>{authScreenState === "login" ? <LoginCard /> : <SignupCard />}</>;
};

export default AuthPage;