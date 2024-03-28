
import { Box, Container } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import AuthPage from "./pages/AuthPage";
import userAtom from "./atoms/userAtom";
import HomePage from "./pages/HomePage";
import UserPage from "./pages/UserPage";
import LogoutButton from './components/LogoutButton'
import CreatePost from "./components/CreatePost";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
function App() {
  const user = useRecoilValue(userAtom);

  return (

    <>
      <Box position={"relative"} w='full'>


        <Container maxW={"620px"}>
          <Header />
          <Routes>
            <Route path='/' element={user ? <HomePage /> : <Navigate to='/auth' />} />
            <Route path='/auth' element={!user ? <AuthPage /> : <Navigate to='/' />} />
            <Route path='/update' element={user ? <UpdateProfilePage /> : <Navigate to='/auth' />} />
            <Route
              path='/:username'
              element={
                user ? (
                  <>
                    <UserPage />
                    <CreatePost />
                  </>
                ) : (
                  <UserPage />
                )
              }
            />
          </Routes>
          <CreatePost />
          <LogoutButton />

        </Container>
      </Box>





    </>
  )
}

export default App
