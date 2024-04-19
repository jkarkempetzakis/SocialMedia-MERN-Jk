import { Button, Text, useColorMode, Icon, Flex, Box } from "@chakra-ui/react";
import useShowToast from "../hooks/useShowToast";
import useLogout from "../hooks/useLogout";
import { FiLogOut } from "react-icons/fi";
import { MdDarkMode, MdLightMode } from "react-icons/md";

export const SettingsPage = () => {
    const showToast = useShowToast();
    const logout = useLogout();
    const { colorMode, toggleColorMode } = useColorMode();

    const freezeAccount = async () => {
        if (!window.confirm("Are you sure you want to freeze your account?")) return;

        try {
            const res = await fetch("/api/users/freeze", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();

            if (data.error) {
                return showToast("Error", data.error, "error");
            }
            if (data.success) {
                await logout();
                showToast("Success", "Your account has been frozen", "success");
            }
        } catch (error) {
            showToast("Error", error.message, "error");
        }
    };

    return (
        <>
            <Flex alignItems={'left'} flexDirection={'column'}>
                <Box><Text my={1} fontWeight={"bold"}>
                    Freeze Your Account
                </Text>
                    <Text my={1}>You can unfreeze your account anytime by logging in.</Text>
                    <Button size={"sm"} colorScheme='red' onClick={freezeAccount}>
                        Freeze
                    </Button>
                </Box>

                <Box pt={5}>  <Button size={"xs"} onClick={toggleColorMode}  >
                    {colorMode === "dark" ? <Icon as={MdDarkMode} w={6} h={6} /> :
                        <Icon as={MdLightMode} w={6} h={6} />}
                </Button>
                </Box>
                <Box pt={5}>
                    <Button size={"xs"} onClick={logout} mr={'2%'} >
                        <FiLogOut size={20} />
                    </Button>

                </Box>

            </Flex>

        </>
    );
};