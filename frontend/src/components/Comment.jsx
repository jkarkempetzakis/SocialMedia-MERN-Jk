import { Avatar, Divider, Flex, Text, useColorMode } from "@chakra-ui/react";


/*
-taking the reply and last reply as props and displaying the comments on the post
-Also adaptive to light/dark mode
*/
const Comment = ({ reply, lastReply }) => {
    const { colorMode } = useColorMode();
    return (
        <>
            <Flex gap={4} py={2} my={2} w={"full"}>
                <Avatar src={reply.userProfilePic} size={"sm"} />
                <Flex gap={1} w={"full"} flexDirection={"column"}>
                    <Flex w={"full"} justifyContent={"space-between"} alignItems={"center"}>
                        <Text fontSize='sm' fontWeight='bold'>
                            {reply.username}
                        </Text>
                    </Flex>
                    <Text>{reply.text}</Text>
                </Flex>
            </Flex>
            {!lastReply ? <Divider my={4} borderColor={colorMode === 'light' ? 'gray.400' : 'gray.600'} /> : null}
        </>
    );
};

export default Comment;