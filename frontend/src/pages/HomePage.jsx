import { Box, Flex, Spinner, Input, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import { SearchIcon } from "@chakra-ui/icons";


const HomePage = () => {
    const [searchingUser, setSearchingUser] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [posts, setPosts] = useRecoilState(postsAtom);
    const [loading, setLoading] = useState(true);
    const showToast = useShowToast();
    const navigate = useNavigate();
    useEffect(() => {
        const getFeedPosts = async () => {
            setLoading(true);
            setPosts([]);
            try {
                const res = await fetch("/api/posts/feed");
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                    return;
                }
                console.log(data);
                setPosts(data);
            } catch (error) {
                showToast("Error", error.message, "error");
            } finally {
                setLoading(false);
            }
        };
        getFeedPosts();
    }, [showToast, setPosts]);

    const handleConversationSearch = async (e) => {
        e.preventDefault();
        setSearchingUser(true);
        try {
            const res = await fetch(`/api/users/profile/${searchText}`);
            const searchedUser = await res.json();
            if (searchedUser.error) {
                showToast("Error", searchedUser.error, "error");
                return;
            } else {
                navigate(`/${searchText}`)
            }
        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setSearchingUser(false);
        }
    };

    return (

        <Flex gap='10' alignItems={"center"} flexDirection={'column'}>
            <Box w={'90%'}>
                <form onSubmit={handleConversationSearch} >
                    <Flex alignItems={"center"} gap={2}>
                        <Input placeholder='Search for a user' size='md' onChange={(e) => setSearchText(e.target.value)} />
                        < Button size={"sm"} onClick={handleConversationSearch} isLoading={searchingUser}>
                            <SearchIcon />
                        </Button>
                    </Flex>
                </form>
            </Box>

            <Box flex={70}>
                {!loading && posts.length === 0 && <h1>Follow some users to see the feed</h1>}

                {loading && (
                    <Flex justify='center'>
                        <Spinner size='xl' />
                    </Flex>
                )}

                {posts.map((post) => (
                    <Post key={post._id} post={post} postedBy={post.postedBy} />
                ))}
            </Box>
            <Box
                flex={30}
                display={{
                    base: "none",
                    md: "block",
                }}
            >


            </Box>

        </Flex>
    );
};

export default HomePage;