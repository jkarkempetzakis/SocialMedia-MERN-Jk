import {
    Avatar,
    AvatarBadge,
    Box,
    Flex,
    Image,
    Stack,
    Text,
    WrapItem,
    useColorMode,
    useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { BsCheck2All, BsFillImageFill } from "react-icons/bs";
import { selectedConversationAtom } from "../atoms/messagesAtom";

/*
-Conversation component 
-Color mode responsive 
*/
const Conversation = ({ conversation, isOnline }) => {
    const user = conversation.participants[0];
    const currentUser = useRecoilValue(userAtom);
    const lastMessage = conversation.lastMessage;
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom);
    const { colorMode } = useColorMode();
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

    console.log("selectedConverstion", selectedConversation);


    useEffect(() => {
        // Check if the last message is not from the current user and is not seen
        if (
            lastMessage &&
            lastMessage.sender !== currentUser._id &&
            !lastMessage.seen
        ) {
            setHasUnreadMessages(true);
        } else {
            setHasUnreadMessages(false);
        }
    }, [lastMessage, currentUser._id]);
    return (
        <Flex
            gap={4}
            alignItems={"center"}
            p={"1"}
            _hover={{
                cursor: "pointer",
                bg: useColorModeValue("gray.600", "gray.dark"),
                color: "white",
            }}
            onClick={() =>
                setSelectedConversation({
                    _id: conversation._id,
                    userId: user._id,
                    userProfilePic: user.profilePic,
                    username: user.username,
                    mock: conversation.mock,
                })
            }
            bg={
                selectedConversation?._id === conversation._id ? (colorMode === "light" ? "gray.400" : "gray.dark") : ""
            }
            borderRadius={"md"}
        >
            <WrapItem>
                {user.profilePic && (
                    <Avatar

                        size={{
                            base: "xs",
                            sm: "sm",
                            md: "md",
                        }}
                        src={user.profilePic}
                    >
                        {isOnline ? <AvatarBadge boxSize='1em' bg='green.500' /> : ""}
                    </Avatar>
                )}
                {!user.profilePic && (
                    <Avatar
                        name={user.name}
                        src='https://bit.ly/broken-link'
                        size={{
                            base: "xs",
                            sm: "sm",
                            md: "md",
                        }}
                    >
                        {isOnline ? <AvatarBadge boxSize='1em' bg='green.500' /> : ""}
                        {hasUnreadMessages && (
                            <Box
                                w="4px"
                                h="4px"
                                bg="red.500"
                                borderRadius="50%"
                                position="absolute"
                                top="0"
                                right="-1px"
                            />
                        )}
                    </Avatar>
                )}



            </WrapItem>

            <Stack direction={"column"} fontSize={"sm"}>
                <Text fontWeight='700' display={"flex"} alignItems={"center"}>
                    {user.username}
                </Text>
                <Text fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1}>
                    {currentUser._id === lastMessage.sender ? (
                        <Box color={lastMessage.seen ? "blue.400" : ""}>
                            <BsCheck2All size={16} />
                        </Box>
                    ) : (
                        ""
                    )}
                    {lastMessage.text.length > 18
                        ? lastMessage.text.substring(0, 18) + "..."
                        : lastMessage.text || <BsFillImageFill size={16} />}
                </Text>
            </Stack>
        </Flex>
    );
};

export default Conversation;