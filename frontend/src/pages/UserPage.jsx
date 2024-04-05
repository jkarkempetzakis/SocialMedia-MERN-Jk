import { useEffect, useState } from "react";
import UserHeader from "../components/UserHeader";
import { useParams } from "react-router-dom";
import useShowToast from "../hooks/useShowToast";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import Post from "../components/Post";
import useGetUserProfile from "../hooks/useGetUserProfile";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import Reply from "../components/Reply";

const UserPage = () => {
    const { user, loading, setLoading } = useGetUserProfile();
    const { username } = useParams();
    const showToast = useShowToast();
    const [posts, setPosts] = useRecoilState(postsAtom);
    const [replies, setReplies] = useState([])
    const [fetchingPosts, setFetchingPosts] = useState(false);
    const [fetchingReplies, setFetchingReplies] = useState(false);
    const [showReplies, setShowReplies] = useState(false);


    useEffect(() => {
        const getPostsOrReplies = async () => {
            if (!user) return;
            setFetchingPosts(true);
            setLoading(true);
            if (fetchingPosts) {
                try {
                    const res = await fetch(`/api/posts/user/${username}`);
                    const data = await res.json();
                    console.log(data);
                    setPosts(data);
                } catch (error) {
                    showToast("Error", error.message, "error");
                    setPosts([]);
                } finally {
                    setFetchingPosts(false);
                    setLoading(false)
                }
            } if (fetchingReplies) {
                console.log("getting replies");
                try {
                    const res = await fetch(`/api/posts/reply/user/${username}`);
                    const data = await res.json();
                    console.log(data);
                    setReplies(data);
                    console.log("this is the " + replies)
                } catch (error) {
                    showToast("Error", error.message, "error");
                    setPosts([]);
                } finally {
                    setFetchingReplies(false);
                    setLoading(false)
                }
            }

        };

        getPostsOrReplies();
    }, [username, showToast, setPosts, user, showReplies]);




    const handleClickThreads = () => {

        setFetchingPosts(true);
        setShowReplies(false)

    };

    const handleClickReplies = () => {
        setFetchingReplies(true);
        setShowReplies(true);


    };

    if (!user && loading) {

        return (
            <></>
            // <Flex justifyContent={"center"}>
            //     <p>I am runnning</p>
            //     <Spinner size={"xl"} />
            // </Flex>
        );
    }

    if (!user && !loading) return <h1>User not found</h1>;

    return (
        <>
            <UserHeader user={user} />
            <Flex w={"full"}>
                <Flex flex={1}
                    borderBottom={!showReplies ? "1.5px solid white" : "1px solid gray"}
                    justifyContent={"center"}
                    pb='3'
                    cursor={"pointer"}
                    onClick={handleClickThreads}>
                    <Text fontWeight={"bold"}> Threads</Text>
                </Flex>
                <Flex
                    flex={1}
                    borderBottom={showReplies ? "1.5px solid white" : "1px solid gray"}
                    justifyContent={"center"}
                    pb='3'
                    cursor={"pointer"}
                    onClick={handleClickReplies}
                >
                    <Text fontWeight={"bold"}> Replies</Text>
                </Flex>
            </Flex>

            {!fetchingPosts && posts.length === 0 && <h1>User has no posts.</h1>}
            {loading && (
                <Flex justifyContent={"center"} my={12}>
                    I am ruining
                    <Spinner size={"xl"} />
                </Flex>
            )}
            {!showReplies && (
                <>
                    {posts.map((post) => (
                        <Post key={post._id} post={post} postedBy={post.postedBy} />
                    ))}
                </>
            )}
            {showReplies && (
                <>
                    {showReplies && (
                        <>
                            {replies.flat().map((reply) => (
                                <Reply key={reply._id} reply={reply} />
                                // <div key={reply._id}>
                                //     <p>Reply by: {reply.username}</p>
                                //     <p>{reply.text}</p>
                                //     {/* Additional fields of the reply if needed */}
                                // </div>
                            ))}
                        </>
                    )}

                </>
            )}

        </>
    );
};

export default UserPage;