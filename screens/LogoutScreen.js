import React, { useContext, useEffect } from 'react';
import { UserContext } from './components/userContext'; // Adjust the import path as necessary
import { View, Text, Button } from 'react-native';

function LogoutScreen({ navigation }) {
    const userContext = useContext(UserContext);
    
    useEffect(() => {
        const logout = async function() {
            try {
                // Optionally handle the server-side logout
                const res = await fetch("http://108.143.161.80:3001/users/logout");
                userContext.setUserContext(null);  // Assuming setUserContext sets the user state to null
                navigation.replace('Login');
            } catch (error) {
                console.error('Logout failed', error);
            }
        };
        logout();
    }, []);

    // Optionally provide a fallback UI
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Logging out...</Text>
        </View>
    );
}

export default LogoutScreen;