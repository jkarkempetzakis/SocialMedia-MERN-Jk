import { Box, Container, Flex, Divider, position, useBreakpointValue } from "@chakra-ui/react";
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
import Profile from "./components/Profile";
import { SocketContextProvider } from "./context/SocketContext";
import SuggestedUsers from "./components/SuggestedUsers";

function App() {
  const user = useRecoilValue(userAtom);
  const { pathname } = useLocation();
  const isLargeScreen = useBreakpointValue({ base: false, lg: true });

  return (
    <Flex>
      {/* Vertical Stack for Header and Content */}
      <Box>
        {/* Header */}
        <Header />



      </Box>

      {/* <Box w='1px' h={"full"} bg='white' my={2}></Box> */}
      {/* Main Content */}
      <Flex flex={1} justifyContent="center" overflowY="auto" >

        <Container maxW={pathname === "/" ? { base: "620px", md: "900px" } : "620px"} m={8} >

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

      {user && isLargeScreen && (
        <Box>
          <Profile />
          <SuggestedUsers />
        </Box>
      )}

    </Flex>
  );
}

export default App;
