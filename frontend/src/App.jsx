import { Box, Container, Flex } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import AuthPage from "./pages/AuthPage";
import userAtom from "./atoms/userAtom";
import HomePage from "./pages/HomePage";
import UserPage from "./pages/UserPage";
import ChatPage from "./pages/ChatPage";
import { SettingsPage } from "./pages/SettingsPage";
import CreatePost from "./components/CreatePost";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header";
import PostPage from "./pages/PostPage";
import { SocketContextProvider } from "./context/SocketContext";

function App() {
  const user = useRecoilValue(userAtom);

  return (
    <Flex>
      {/* Vertical Stack for Header and Content */}
      <Box>
        {/* Header */}
        <Header />
      </Box>

      {/* Main Content */}
      <Flex flex={1} justifyContent="center">
        <Container maxW={"620px"} p={0} m={8}>

          <Routes>
            <Route
              path='/'
              element={user ? <HomePage /> : <Navigate to='/auth' />}
            />
            <Route
              path='/auth'
              element={!user ? <AuthPage /> : <Navigate to='/' />}
            />
            <Route
              path='/update'
              element={user ? <UpdateProfilePage /> : <Navigate to='/auth' />}
            />
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
            <Route path='/:username/post/:pid' element={<PostPage />} />
            <Route
              path='/chat'
              element={user ? <ChatPage /> : <Navigate to={"/auth"} />}
            />
            <Route
              path='/settings'
              element={user ? <SettingsPage /> : <Navigate to={"/auth"} />}
            />
          </Routes>
        </Container>
      </Flex>
    </Flex>
  );
}

export default App;
