import React from 'react';
import { Link as RouterLink } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { Avatar, Flex, Text } from "@chakra-ui/react"; // Assuming RxAvatar is meant to be Avatar
import userAtom from "../atoms/userAtom";

const Profile = () => {
    const user = useRecoilValue(userAtom);

    return (
        <RouterLink to={`/${user?.username}`} >
            <Flex gap={3} mb={4} py={5} w={'300px'} mt={'5%'}>
                <Avatar
                    size='md'
                    name={user?.name}
                    src={user?.profilePic} />
                <Flex flexDirection={"column"} alignItems={"right"}>


                    <Text fontSize={"l"} fontWeight={"bold"}>
                        {user?.name}
                    </Text>
                    <Text fontSize={"sm"}>{user?.username}</Text>
                </Flex>
            </Flex>


        </RouterLink >
    );
}

export default Profile;
