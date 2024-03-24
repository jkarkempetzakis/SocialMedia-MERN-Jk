
import { useRecoilValue } from "recoil";
import AuthPage from "./pages/AuthPage";
import userAtom from "./atoms/userAtom";
import HomePage from "./pages/HomePage";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
function App() {
  const user = useRecoilValue(userAtom);

  return (

    <>

      <Routes>
        <Route path='/' element={user ? <HomePage /> : <Navigate to='/auth' />} />
        <Route path='/auth' element={!user ? <AuthPage /> : <Navigate to='/' />} />
      </Routes>



    </>
  )
}

export default App
