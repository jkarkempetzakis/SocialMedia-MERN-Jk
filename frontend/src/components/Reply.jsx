import { Avatar, Divider, Flex, Text, Box } from "@chakra-ui/react";
import postsAtom from "../atoms/postsAtom";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { Link, useNavigate } from "react-router-dom";


/*
-Takes a reply as prop and based on its id finds the user that made the reply
-Displays replies the replies of the user
-Finds the user that made the post via api call
-Links to the post the user has replied to
*/
const Reply = ({ reply }) => {

    const showToast = useShowToast();
    const [user, setUser] = useState(null);
    const [fetchingPosts, setFetchingPosts] = useState(true);
    const [replyingToPost, setReplyingToPost] = useState(null);

    //will run every time the reply id changes, basically for every reply
    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch(`/api/users/reply/${reply?._id}`);
                const data = await res.json();

                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                setUser(data);
            } catch (error) {
                showToast("Error", error.message, "error");
                setUser(null);
            }
        };

        getUser();
    }, [reply?._id, showToast]);


    //this also runs every time the reply id changes so again for every reply
    useEffect(() => {
        const getPosts = async () => {

            setFetchingPosts(true);
            try {

                const res = await fetch(`/api/posts/reply/${reply?._id}`);
                const data = await res.json();

                if (data) {

                    setReplyingToPost(data); // Set the post being replied to


                } else {
                    showToast("Error", "Post data is empty", "error");
                }
            } catch (error) {
                showToast("Error", error.message, "error");

            } finally {
                setFetchingPosts(false);
            }
        };

        getPosts();

    }, [reply?._id, showToast]);






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
                <Flex w={"full"} justifyContent={"space-between"} alignItems={"center"}>
                    <Text fontSize='sm' fontWeight='bold'>
                        Replying to:
                    </Text>
                    {fetchingPosts ? (
                        <Text>Loading...</Text>
                    ) : replyingToPost && user ? (
                        <>
                            <Link to={`/${user.username}/post/${replyingToPost[0]._id}`}>
                                <Box borderRadius={7} overflow={"hidden"} border={"1px solid"} borderColor={"gray.light"} p={2}>
                                    <Flex gap={1} w={"full"} flexDirection={"column"} alignItems={"center"}  >
                                        {user.profilePic && (
                                            <Avatar
                                                name={user.name}
                                                src={user.profilePic}
                                                size={
                                                    "sm"}
                                            />
                                        )}
                                        {!user.profilePic && (
                                            <Avatar
                                                name={user.name}
                                                src='https://bit.ly/broken-link'
                                                size={
                                                    "sm"

                                                }
                                            />
                                        )}

                                        <Text>{user.username + "'s post."}</Text>
                                    </Flex>
                                </Box>

                            </Link>
                        </>

                    ) : (
                        <Text>Post not found</Text>
                    )}
                </Flex>
            </Flex>

        </>
    );
};

export default Reply;