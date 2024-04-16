//react imports

import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import { BsFillChatQuoteFill, } from "react-icons/bs";
import { IoIosNotificationsOutline, IoIosNotifications, IoMdNotifications, IoMdNotificationsOutline } from "react-icons/io";
import { MdOutlineSettings } from "react-icons/md";

//chakra ui+ packages
import { Button, Flex, Image, Link, useColorMode, MenuItem, Menu, MenuButton, MenuList, Icon, Center, Badge, Box, VStack } from "@chakra-ui/react";

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





/*
-Displays icons that are links to different routs on the app
*/
const Header = () => {
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


  // const getNotificationUser = async (senderId) => {
  //   try {
  //     const res = await fetch(`/api/users/profile/${senderId}`);
  //     const data = await res.json();
  //     console.log("Received user data:", data);

  //     if (data.error) {
  //       showToast("Error", data.error, "error");
  //     } else {
  //       // Check if the user already exists in otherUser state
  //       const existingUserIndex = otherUser.findIndex(user => user._id === data._id);
  //       if (existingUserIndex !== -1) {
  //         // If the user already exists, update their data
  //         setOtherUser(prevUsers => {
  //           const updatedUsers = [...prevUsers];
  //           updatedUsers[existingUserIndex] = data;
  //           return updatedUsers;
  //         });
  //         console.log("Updated otherUser:", otherUser);
  //       } else {
  //         // If the user doesn't exist, add them to the state
  //         setOtherUser(prevUsers => [data, ...prevUsers]);
  //         console.log("Added new user to otherUser:", [data, ...otherUser]);
  //       }
  //     }
  //   } catch (error) {
  //     showToast("Error", error, "error");
  //     console.error("Error fetching user data:", error);
  //   }
  // }

  // const setConversation = async (conversationId, senderId, index) => {
  //   try {
  //     const res = await fetch(`/api/users/profile/${senderId}`);
  //     const data = await res.json();
  //     console.log("Received user data:", data);

  //     if (data.error) {
  //       showToast("Error", data.error, "error");
  //     } else {
  //       setSelectedConversation({
  //         _id: conversationId,
  //         userId: senderId,
  //         username: data.username,
  //         userProfilePic: data.userProfilePic,
  //         mock: "",
  //       });
  //       console.log("Selected conversation set successfully:", {
  //         _id: conversationId,
  //         userId: senderId,
  //         username: data.username,
  //         userProfilePic: data.userProfilePic,
  //         mock: "",
  //       });
  //     }
  //   } catch (error) {
  //     showToast("Error", error.message, "error");
  //     console.error("Error setting conversation:", error);
  //   }
  // };

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
  // const setConversation = (conversationId, senderId, index) => {
  //   let user = otherUser[index]
  //   try {
  //     setSelectedConversation({
  //       _id: conversationId,
  //       userId: senderId,
  //       username: user.username,
  //       userProfilePic: user.userProfilePic,
  //       mock: "",
  //     });
  //     console.log("Selected conversation set successfully:", {
  //       _id: conversationId,
  //       userId: senderId,
  //       username: user.username,
  //       userProfilePic: user.userProfilePic,
  //       mock: "",
  //     });
  //   } catch (error) {
  //     showToast("Error", error.message, "error");
  //     console.error("Error setting conversation:", error);
  //   }
  // }






  // const renderMessages = (messages) => {

  //   if (messages.length === 0) {
  //     return (
  //       <MenuItem>
  //         <Center>No New Messages</Center>
  //       </MenuItem>
  //     );
  //   }









  //   const latestMessages = Object.values(
  //     unreadMessages.reduce((acc, message) => {
  //       console.log("Current message:", message);
  //       console.log("Current accumulator:", acc);

  //       if (!acc[message.conversationId] || acc[message.conversationId].timestamp < message.timestamp) {
  //         console.log("Updating accumulator with message:", message);
  //         acc[message.conversationId] = message;
  //       } else {
  //         console.log("Not updating accumulator. Existing message is newer.");
  //       }

  //       console.log("Accumulator after update:", acc);
  //       return acc;
  //     }, {})
  //   );

  //   console.log("Latest messages:", latestMessages);

  //   return latestMessages.map((message, index) => (
  //     <MenuItem key={index}>
  //       <Link as={RouterLink} to={`/chat`} onClick={() => handleNotificationClick(message, index)}>
  //         {otherUser.username}
  //       </Link>
  //     </MenuItem>
  //   ));
  // }

  //make a state to hold the user object and pass its information 






  // setUnreadMessages(unreadMessages.filter((n) => n !== message))


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
    <VStack justifyContent={"space-between"} mt={6} mb='12'>
      {user && (
        <Link as={RouterLink} to='/'>
          <AiFillHome size={24} />
        </Link>
      )}
      {!user && (
        <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("login")}>
          Login
        </Link>
      )}

      <Image
        cursor={"pointer"}
        alt='logo'
        w={6}
        src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
        onClick={toggleColorMode}
      />

      {user && (
        <VStack alignItems={"center"} gap={4}>
          <Link as={RouterLink} to={`/${user.username}`}>
            <RxAvatar size={24} />
          </Link>
          <Link as={RouterLink} to={`/chat`}>
            <BsFillChatQuoteFill size={20} color={haveUnread ? "red" : ''} />
          </Link>
          <Menu>
            <Box position="relative">
              <MenuButton mt={2}>
                {colorMode === "dark" ? <Icon as={IoMdNotificationsOutline} w={6} h={6} /> :
                  <Icon as={IoMdNotifications} w={6} h={6} />}
              </MenuButton>
              {unreadMessages.length > 0 && (
                <Box
                  position="absolute"
                  top="2%"
                  left="30%"
                  transform="translate(10%, -10%)"
                >
                  <Badge colorScheme="red" borderRadius="full" px={2}>
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
          <Link as={RouterLink} to={`/settings`}>
            <MdOutlineSettings size={20} />
          </Link>
          <Button size={"xs"} onClick={logout}>
            <FiLogOut size={20} />
          </Button>
        </VStack>
      )}

      {!user && (
        <Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("signup")}>
          Sign up
        </Link>
      )}
    </VStack>
  );
};

export default Header;