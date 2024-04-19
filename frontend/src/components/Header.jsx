//react imports

import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import { BsFillChatQuoteFill, } from "react-icons/bs";
import { IoIosNotificationsOutline, IoIosNotifications, IoMdNotifications, IoMdNotificationsOutline } from "react-icons/io";
import { MdOutlineSettings, MdDarkMode, MdLightMode } from "react-icons/md";

//chakra ui+ packages
import { Button, Flex, Image, Link, useColorMode, MenuItem, Menu, MenuButton, MenuList, Icon, Center, Badge, Box, VStack, useColorModeValue, Avatar, useMediaQuery } from "@chakra-ui/react";

//JSX
import useLogout from "../hooks/useLogout";

//Recoil
import { useRecoilValue, useSetRecoilState, useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import authScreenAtom from "../atoms/authAtom";
import { unreadMessagesAtom } from "../atoms/unreadMessagesAtom";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { useSocket } from "../context/SocketContext.jsx";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import Footer from "./Footer.jsx";




/*
-Displays icons that are links to different routs on the app
*/
const Header = () => {
  const [isLargeScreen, isBetween430And768] = useMediaQuery([
    "(min-width: 768px)", // Large screen breakpoint
    "(min-width: 431px) and (max-width: 767px)", // Between 430 and 768 pixels
    "(max-width: 430px)", // Custom breakpoint for 430 pixels
  ]);
  const showToast = useShowToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const [unreadMessages, setUnreadMessages] = useRecoilState(unreadMessagesAtom);
  const [haveUnread, setHaveUnread] = useState(false);
  const { socket } = useSocket();
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
  const [otherUser, setOtherUser] = useState([])

  const getUnreadMessages = async () => {
    try {
      console.log("trying to run the first one")
      const res = await fetch(`/api/messages/unread/${user._id}`);
      const data = await res.json();
      console.log("this is data" + JSON.stringify(data[0]))
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      if (data.length > 0) {
        setHaveUnread(true)
        setUnreadMessages(data)
        console.log("true is running")
        data.forEach(message => {
          getNotificationUser(message.sender);
          console.log("trying to run")
        });
      } else {
        setHaveUnread(false)
        console.log("false is running")
        // Iterate over the unread messages and fetch corresponding user data

      }
    } catch (error) {
      showToast("Error", error.message, "error");
      console.log("this happened")
    }
  };

  const getNotificationUser = async (senderId) => {
    try {
      const res = await fetch(`/api/users/profile/${senderId}`);
      const data = await res.json();
      console.log("Received user data:", data);

      if (data.error) {
        showToast("Error", data.error, "error");
      } else {
        // Check if the user already exists in otherUser state
        setOtherUser(prevUsers => {
          // Use a functional update to ensure you're working with the latest state value
          const updatedUsers = [...prevUsers];
          // Update the user data or add new user if not exists
          const existingUserIndex = updatedUsers.findIndex(user => user._id === data._id);
          if (existingUserIndex !== -1) {
            updatedUsers[existingUserIndex] = data;
          } else {
            updatedUsers.unshift(data);
          }
          console.log("Updated otherUser:", updatedUsers);
          return updatedUsers; // Return the updated state
        });
      }
    } catch (error) {
      showToast("Error", error.message, "error");
      console.error("Error fetching user data:", error);
    }
  };



  const setConversation = async (conversationId, senderId, index) => {
    try {
      const res = await fetch(`/api/users/profile/${senderId}`);
      const data = await res.json();
      console.log("Received user data:", data);
      console.log("there are the current unread mesasges:", unreadMessages)

      if (data.error) {
        showToast("Error", data.error, "error");
      } else if (!conversationId) {
        const message = unreadMessages.find(msg => msg.sender === senderId);
        console.log("this is the message.conversation id", message)
        if (message) {
          const newConversationId = message.origin
          setSelectedConversation({
            _id: message.conversationId,
            userId: senderId,
            username: otherUser[index].username,
            userProfilePic: data.userProfilePic,
            mock: "",
          });
          console.log("Selected conversation set successfully:", {
            _id: conversationId,
            userId: senderId,
            username: otherUser[index].username,
            userProfilePic: "data.userProfilePic",
            mock: "",
          });
        }

      } else {
        setSelectedConversation({
          _id: conversationId,
          userId: senderId,
          username: otherUser[index].username,
          userProfilePic: data.userProfilePic,
          mock: "",
        });
        console.log("Selected conversation set successfully:", {
          _id: conversationId,
          userId: senderId,
          username: otherUser[index].username,
          userProfilePic: "data.userProfilePic",
          mock: "",
        });
      }
    } catch (error) {
      showToast("Error", error.message, "error");
      console.error("Error setting conversation:", error);
    }
  };

  useEffect(() => {
    console.log("these are the current", unreadMessages);
  }, [otherUser]);



  const handleNotificationClick = async (message, index) => {
    console.log("conversation id", message.conversationId);
    console.log("sender id", message.sender);
    console.log(index);
    await setConversation(message.conversationId, message.sender, index);
    handleNotificationRemoval(message)
    console.log("Selected conversation:", selectedConversation);
  };

  useEffect(() => {
    // Initial fetch of unread messages
    getUnreadMessages();
  }, [showToast]);
  //  }, [showToast, setHaveUnread, unreadMessages]);

  const handleNotificationRemoval = (message) => {
    // Filter out the message with the provided message._id
    const updatedUnreadMessages = unreadMessages.filter(msg => msg._id !== message._id);
    // Set the updated unreadMessages state
    setUnreadMessages(updatedUnreadMessages);
  };




  useEffect(() => {

    if (!socket) {
      console.log("no socket")
      return;

    }

    const handleNewMessage = async (message) => {
      // Check if there is already a message with the same conversation ID
      await getNotificationUser(message.sender)
      const existingMessageIndex = unreadMessages.findIndex(
        (msg) => msg.conversationId === message.conversationId
      );

      if (existingMessageIndex !== -1) {
        // If a message with the same conversation ID exists, replace it with the new message
        setUnreadMessages((prevUnreadMessages) => {
          const updatedMessages = [...prevUnreadMessages];
          updatedMessages[existingMessageIndex] = message;
          return updatedMessages;
        });
      } else {
        // If no message with the same conversation ID exists, add the new message to the array
        await setUnreadMessages((prevUnreadMessages) => [...prevUnreadMessages, message]);

      }

      console.log("new to the block" + JSON.stringify(unreadMessages));

    };

    socket.on('newMessage', handleNewMessage);
    // Update unread messages



    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, setUnreadMessages, unreadMessages, selectedConversation]);




  return (
    <>
      {isLargeScreen ? (
        <Flex flexDirection={"column"} w="300px" >
          <Flex mt={'1%'} mb='12' ml={8} p={6} position="fixed">
            <Image
              cursor={"pointer"}
              alt='logo'
              w={6}
              src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}

            />

          </Flex>


          <Flex alignItems={"left"} flexDirection={"column"} justifyContent={"space-between"} mt={'7%'} mb='12' gap={10} ml={4} p={6} position="fixed" w="20%">




            {user && (
              <Box


                borderRadius="md"
                _hover={{
                  cursor: "pointer",
                  bg: useColorModeValue("gray.600", "gray.dark"),
                  color: "white",

                }}

                // border="1px solid transparent" // Initial transparent border
                // borderRadius="md"
                p={3} w={'90%'}
              >
                <Flex alignItems="center" >
                  <Link as={RouterLink} to='/' alignItems="center" display="flex" _hover={{ textDecoration: 'none' }}>
                    <AiFillHome size={30} /><Box ml={2}>Home</Box>
                  </Link>
                </Flex>
              </Box>

            )}
            {!user && (
              <div>   <Flex
                flexDirection="inline-block"
                w="20%"
                position="fixed"
                top="0"
                zIndex="999"
                left={'95%'}
                alignItems="right"

                px={4}
              >
                <Button size={"md"} onClick={toggleColorMode} mt={'1%'} mb={"1%"} >
                  {colorMode === "dark" ? <Icon as={MdLightMode} w={7} h={7} /> : <Icon as={MdDarkMode} w={7} h={7} />}
                </Button>
              </Flex>
                <Flex
                  flexDirection="inline-block"
                  w="100%"
                  position="fixed"
                  bottom="1"
                  zIndex="999"


                  gap={14}
                  alignItems="center"

                  px={4}
                ><Footer /></Flex>
              </div>


            )}

            {user && (

              <Flex alignItems={"left"} flexDirection={"column"} gap={10} >

                <Box


                  borderRadius="md"
                  _hover={{
                    cursor: "pointer",
                    bg: useColorModeValue("gray.600", "gray.dark"),
                    color: "white",

                  }}

                  // border="1px solid transparent" // Initial transparent border
                  // borderRadius="md"
                  w={'90%'} p={3}
                >
                  <Flex alignItems="center">
                    <Link as={RouterLink} to={`/${user.username}`} alignItems="center" display="flex" _hover={{ textDecoration: 'none' }}>
                      <Avatar
                        size='sm'
                        name={user?.name}
                        src={user?.profilePic} /><Box ml={2}>Profile</Box>
                    </Link>

                  </Flex>
                </Box>


                <Box


                  borderRadius="md"
                  _hover={{
                    cursor: "pointer",
                    bg: useColorModeValue("gray.600", "gray.dark"),
                    color: "white",

                  }}

                  // border="1px solid transparent" // Initial transparent border
                  // borderRadius="md"
                  p={3} w={'90%'}
                >

                  <Flex alignItems="center">
                    <Link as={RouterLink} to={`/chat`} alignItems="center" display="flex" _hover={{ textDecoration: 'none' }}>
                      <BsFillChatQuoteFill size={27} />
                      <Box ml={2}>Messages</Box>
                    </Link>
                  </Flex>
                </Box>

                <Box


                  borderRadius="md"
                  _hover={{
                    cursor: "pointer",
                    bg: useColorModeValue("gray.600", "gray.dark"),
                    color: "white",

                  }}

                  // border="1px solid transparent" // Initial transparent border
                  // borderRadius="md"
                  p={3} w={'90%'}
                >
                  <Flex alignItems="center">
                    <Menu>
                      <Box position="relative" display={"flex"} >
                        <MenuButton ml={-1}>
                          <Flex alignItems="center">
                            {colorMode === "dark" ? <Icon as={IoMdNotificationsOutline} w={8} h={8} /> :
                              <Icon as={IoMdNotifications} w={8} h={8} />}
                            <Box ml={2}>Notifications</Box>
                          </Flex>

                        </MenuButton>

                        {unreadMessages.length > 0 && (
                          <Box
                            position="absolute"


                            transform="translate(30%, -40%)"
                          >
                            <Badge colorScheme="red" borderRadius="full" variant={'solid'} px={2}>
                              {unreadMessages.length}
                            </Badge>
                          </Box>
                        )}
                      </Box>
                      <MenuList>
                        {unreadMessages.length === 0 ? (
                          <MenuItem>
                            <Center>No New Messages</Center>
                          </MenuItem>
                        ) : unreadMessages.map((message, index) => {
                          console.log("Mapping message:", message);
                          console.log("Message index", index) // Add this console log
                          return (
                            <MenuItem key={index}>
                              <Link as={RouterLink} to={`/chat`} onClick={() => handleNotificationClick(message, index)}>
                                {otherUser.find(user => user._id === message.sender)?.username + " " + message.text || "Unknown User"}
                              </Link>
                            </MenuItem>
                          );
                        })
                        }
                      </MenuList>

                    </Menu>
                  </Flex>
                </Box>
                <Box


                  borderRadius="md"
                  _hover={{
                    cursor: "pointer",
                    bg: useColorModeValue("gray.600", "gray.dark"),
                    color: "white",

                  }}

                  // border="1px solid transparent" // Initial transparent border
                  // borderRadius="md"
                  p={3} w={'90%'}
                >
                  <Flex alignItems="center" >
                    <Link as={RouterLink} to={`/settings`} alignItems="center" display="flex" _hover={{ textDecoration: 'none' }} >
                      <MdOutlineSettings size={30} /><Box ml={2}>Settings</Box>
                    </Link>
                  </Flex>
                </Box>
                <Button size={"xs"} onClick={toggleColorMode} w={'10%'} mt={'60%'} ml={'5%'}>
                  {colorMode === "dark" ? <Icon as={MdDarkMode} w={6} h={6} /> :
                    <Icon as={MdLightMode} w={6} h={6} />}
                </Button>
                <Button size={"xs"} onClick={logout} w={'20%'} mt={'1%'} ml={'5%'}>
                  <FiLogOut size={20} />
                </Button>

              </Flex>


            )}



          </Flex>
          <Box w='1px' h={"100%"} bg='gray.light' my={2} position="fixed" ml={"20%"} />
        </Flex >
      ) : isBetween430And768 ? (
        <>{user && (
          <Flex
            flexDirection="inline-block"
            w="100%"
            position="fixed"
            bottom="0"
            zIndex="999"
            // bgColor="gray.dark"
            boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
            gap={14}
            bgColor={colorMode === "dark" ? "grey.dark" : "white"}


          // borderTop="1px solid #E2E8F0"
          >
            <Flex alignItems="center" ml={"10%"}  >
              <Link as={RouterLink} to='/' alignItems="center" display="flex" _hover={{ textDecoration: 'none' }}>
                <AiFillHome size={30} />
              </Link>
            </Flex>
            <Flex alignItems="center">
              <Link as={RouterLink} to={`/${user?.username}`} _hover={{ textDecoration: 'none' }}>
                <Avatar
                  size='sm'
                  name={user?.name}
                  src={user?.profilePic} />
              </Link>

            </Flex>



            <Flex alignItems="center">
              <Link as={RouterLink} to={`/chat`} alignItems="center" display="flex" _hover={{ textDecoration: 'none' }}>
                <BsFillChatQuoteFill size={27} />

              </Link>
            </Flex>



            <Flex alignItems="center">
              <Menu>
                <Box position="relative" display={"flex"} >
                  <MenuButton ml={-1}>
                    <Flex alignItems="center">
                      {colorMode === "dark" ? <Icon as={IoMdNotificationsOutline} w={8} h={8} /> :
                        <Icon as={IoMdNotifications} w={8} h={8} />}

                    </Flex>

                  </MenuButton>

                  {unreadMessages.length > 0 && (
                    <Box
                      position="absolute"


                      transform="translate(30%, -40%)"
                    >
                      <Badge colorScheme="red" borderRadius="full" variant={'solid'} px={2}>
                        {unreadMessages.length}
                      </Badge>
                    </Box>
                  )}
                </Box>
                <MenuList>
                  {unreadMessages.length === 0 ? (
                    <MenuItem>
                      <Center>No New Messages</Center>
                    </MenuItem>
                  ) : unreadMessages.map((message, index) => {
                    console.log("Mapping message:", message);
                    console.log("Message index", index) // Add this console log
                    return (
                      <MenuItem key={index}>
                        <Link as={RouterLink} to={`/chat`} onClick={() => handleNotificationClick(message, index)}>
                          {otherUser.find(user => user._id === message.sender)?.username + " " + message.text || "Unknown User"}
                        </Link>
                      </MenuItem>
                    );
                  })
                  }
                </MenuList>

              </Menu>
            </Flex>


            <Flex alignItems="center" >
              <Link as={RouterLink} to={`/settings`} _hover={{ textDecoration: 'none' }} >
                <MdOutlineSettings size={30} />
              </Link>
            </Flex>

            <Button size={"xs"} onClick={toggleColorMode} mt={'2%'} mb={"2%"} >
              {colorMode === "dark" ? <Icon as={MdDarkMode} w={5} h={5} /> :
                <Icon as={MdLightMode} w={5} h={5} />}
            </Button>
            <Button size={"xs"} onClick={logout} mt={'2%'} pt={'5px'} pb={'5px'}>
              <FiLogOut size={25} />
            </Button>
          </Flex >


        )}
          <><Flex
            flexDirection="inline-block"
            w="100%"
            position="fixed"
            top="0"
            zIndex="999"
            // bgColor="gray.dark"
            boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
            gap={35}
            bgColor={colorMode === "dark" ? "grey.dark" : "white"}
            alignItems={'center'}
            justifyContent="flex-start" // Align items to the start (top left)
            px={4} // Add padding to adjust button position



          // borderTop="1px solid #E2E8F0"
          > {!user && (
            <div>  <Flex
              flexDirection="inline-block"
              w="20%"
              position="fixed"
              top="2"
              zIndex="999"
              left={'90%'}
              alignItems="right"

              px={4}
            >
              <Button size={"sm"} onClick={toggleColorMode} mt={'1%'} mb={"1%"} >
                {colorMode === "dark" ? <Icon as={MdLightMode} w={5} h={5} /> : <Icon as={MdDarkMode} w={5} h={5} />}
              </Button>
            </Flex>
              <Flex justifyContent="center" flex="1"> {/* Centering container for the image */}
                <Image
                  cursor={"pointer"}
                  alt='logo'
                  w={6}
                  src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
                />
              </Flex>
            </div>
            // <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("login")}>

            // </Link>

          )} </Flex>
          </>





        </>




      ) : (
        <>{user && (
          <Flex
            flexDirection="inline-block"
            w="100%"
            position="fixed"
            bottom="0"
            zIndex="999"
            // bgColor="gray.dark"
            boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
            gap={10}
            bgColor={colorMode === "dark" ? "grey.dark" : "white"}


          // borderTop="1px solid #E2E8F0"
          >
            <Flex alignItems="center" ml={"15%"} mt={'1%'} >
              <Link as={RouterLink} to='/' alignItems="center" display="flex" _hover={{ textDecoration: 'none' }}>
                <AiFillHome size={23} />
              </Link>
            </Flex>
            <Flex alignItems="center">
              <Link as={RouterLink} to={`/${user?.username}`} _hover={{ textDecoration: 'none' }}>
                <Avatar
                  size='xs'
                  name={user?.name}
                  src={user?.profilePic} />
              </Link>

            </Flex>



            <Flex alignItems="center">
              <Link as={RouterLink} to={`/chat`} alignItems="center" display="flex" _hover={{ textDecoration: 'none' }}>
                <BsFillChatQuoteFill size={20} />

              </Link>
            </Flex>



            <Flex alignItems="center">
              <Menu>
                <Box position="relative" display={"flex"} >
                  <MenuButton ml={-1}>
                    <Flex alignItems="center">
                      {colorMode === "dark" ? <Icon as={IoMdNotificationsOutline} w={6} h={6} /> :
                        <Icon as={IoMdNotifications} w={6} h={6} />}

                    </Flex>

                  </MenuButton>

                  {unreadMessages.length > 0 && (
                    <Box
                      position="absolute"


                      transform="translate(30%, -40%)"
                    >
                      <Badge colorScheme="red" borderRadius="full" variant={'solid'} px={2}>
                        {unreadMessages.length}
                      </Badge>
                    </Box>
                  )}
                </Box>
                <MenuList>
                  {unreadMessages.length === 0 ? (
                    <MenuItem>
                      <Center>No New Messages</Center>
                    </MenuItem>
                  ) : unreadMessages.map((message, index) => {
                    console.log("Mapping message:", message);
                    console.log("Message index", index) // Add this console log
                    return (
                      <MenuItem key={index}>
                        <Link as={RouterLink} to={`/chat`} onClick={() => handleNotificationClick(message, index)}>
                          {otherUser.find(user => user._id === message.sender)?.username + " " + message.text || "Unknown User"}
                        </Link>
                      </MenuItem>
                    );
                  })
                  }
                </MenuList>

              </Menu>
            </Flex>


            <Flex alignItems="center" >
              <Link as={RouterLink} to={`/settings`} _hover={{ textDecoration: 'none' }} >
                <MdOutlineSettings size={20} />
              </Link>
            </Flex>

          </Flex >


        )}
          <><Flex
            flexDirection="inline-block"
            w="100%"
            position="fixed"
            top="0"
            zIndex="999"
            // bgColor="gray.dark"
            boxShadow="0px 0px 10px rgba(0, 0, 0, 0.1)"
            gap={35}
            bgColor={colorMode === "dark" ? "grey.dark" : "white"}
            alignItems={'center'}
            justifyContent="flex-start" // Align items to the start (top left)
            px={4} // Add padding to adjust button position



          // borderTop="1px solid #E2E8F0"
          > {!user && (
            <div>  <Flex
              flexDirection="inline-block"
              w="20%"
              position="fixed"
              top="2"
              zIndex="999"
              left={'90%'}
              alignItems="right"

              px={4}
            >
              <Button size={"sm"} onClick={toggleColorMode} mt={'1%'} mb={"1%"} >
                {colorMode === "dark" ? <Icon as={MdLightMode} w={5} h={5} /> : <Icon as={MdDarkMode} w={5} h={5} />}
              </Button>
            </Flex>
              <Flex justifyContent="center" flex="1"> {/* Centering container for the image */}
                <Image
                  cursor={"pointer"}
                  alt='logo'
                  w={6}
                  src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
                />
              </Flex>
            </div>
            // <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("login")}>

            // </Link>

          )} </Flex>
          </>





        </>

      )
      }
    </>

  );
};

export default Header;