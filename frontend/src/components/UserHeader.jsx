//react imports
import { Link as RouterLink } from "react-router-dom";
import { BsInstagram } from "react-icons/bs";
import { CgMoreO } from "react-icons/cg";
//chakra ui + packages
import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Portal } from "@chakra-ui/portal";
import { Button, useToast } from "@chakra-ui/react";
//JSX
import useFollowUnfollow from "../hooks/useFollowUnfollow";
//Recoil
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";







/*
-Light/Dark mode adaptability
-Gets current user data and renders it
*/
const UserHeader = ({ user }) => {
    const toast = useToast();

    const currentUser = useRecoilValue(userAtom); // logged in user
    const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);

    //function to copy profile url
    const copyURL = () => {
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL).then(() => {
            toast({
                title: "Success.",
                status: "success",
                description: "Profile link copied.",
                duration: 3000,
                isClosable: true,
            });
        });
    };

    return (
        <VStack gap={4} alignItems={"start"}>
            <Flex justifyContent={"space-between"} w={"full"}>
                <Box>
                    <Text fontSize={"2xl"} fontWeight={"bold"}>
                        {user.name}
                    </Text>
                    <Flex gap={2} alignItems={"center"}>
                        <Text fontSize={"sm"}>{user.username}</Text>
                        <Text fontSize={"xs"} bg={"gray.dark"} color={"gray.light"} p={1} borderRadius={"full"}>
                            threads.net
                        </Text>
                    </Flex>
                </Box>
                <Box>
                    {user.profilePic && (
                        <Avatar
                            name={user.name}
                            src={user.profilePic}
                            size={{
                                base: "md",
                                md: "xl",
                            }}
                        />
                    )}
                    {!user.profilePic && (
                        <Avatar
                            name={user.name}
                            src='https://bit.ly/broken-link'
                            size={{
                                base: "md",
                                md: "xl",
                            }}
                        />
                    )}
                </Box>
            </Flex>

            <Text>{user.bio}</Text>

            {currentUser?._id === user._id && (
                <Link as={RouterLink} to='/update'>
                    <Button size={"sm"}>Update Profile</Button>
                </Link>
            )}
            {currentUser?._id !== user._id && (
                <Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>
                    {following ? "Unfollow" : "Follow"}
                </Button>
            )}
            <Flex w={"full"} justifyContent={"space-between"}>
                <Flex gap={2} alignItems={"center"}>
                    <Text color={"gray.light"}>{user.followers.length} followers</Text>
                    <Box w='1' h='1' bg={"gray.light"} borderRadius={"full"}></Box>
                    <Link color={"gray.light"}>instagram.com</Link>
                </Flex>
                <Flex gap={2}>
                    <Box className='icon-container'>
                        <BsInstagram size={24} cursor={"pointer"} />
                    </Box>
                    <Box className='icon-container' mr={4}>
                        <Menu>
                            <MenuButton>
                                <CgMoreO size={24} cursor={"pointer"} />
                            </MenuButton>
                            <Portal>
                                <MenuList bg={"gray.dark"}>
                                    <MenuItem bg={"gray.dark"} onClick={copyURL}>
                                        Copy link
                                    </MenuItem>
                                </MenuList>
                            </Portal>
                        </Menu>
                    </Box>
                </Flex>
            </Flex>
        </VStack>
    );
};

export default UserHeader;