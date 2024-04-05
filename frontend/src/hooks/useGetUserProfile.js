import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useShowToast from './useShowToast';

//hook to get user profile
const useGetUserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    //getting username from params
    const { username } = useParams();
    const showToast = useShowToast();

    //Api request to get user based on username
    //useEffect will run again if username is changed
    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch(`/api/users/profile/${username}`);
                const data = await res.json();
                if (data.error) {
                    showToast("Error", data.error, "error");
                }
                setUser(data);
            } catch (error) {
                showToast("Error", error, "error")
            } finally {
                setLoading(false);
            }
        }
        getUser();

    }, [username, showToast]);
    return { loading, user, setLoading }
}

export default useGetUserProfile;