import { Avatar, Divider, Flex, Text } from "@chakra-ui/react";
import postsAtom from "../atoms/postsAtom";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";



const Reply = ({ reply }) => {

    const showToast = useShowToast();
    const [user, setUser] = useState(null);
    const [fetchingPosts, setFetchingPosts] = useState(true);
    const [replyingToPost, setReplyingToPost] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch(`/api/users/reply/${reply?._id}`);
                const data = await res.json();
                console.log(data)
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



    useEffect(() => {
        const getPosts = async () => {

            setFetchingPosts(true);
            try {
                console.log("trying");
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
                            <Text>{user.username + "'s post."}</Text></>

                        //<Text>{user.username + "" + replyingToPost[0].text}</Text>
                    ) : (
                        <Text>Post not found</Text>
                    )}
                </Flex>
            </Flex>

        </>
    );
};

export default Reply;