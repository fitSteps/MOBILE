import React, { useContext, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { UserContext } from './components/userContext';
import createClient, { connectClient, publishMessage } from '../mqttClient';

function LogoutScreen({ navigation }) {
    const userContext = useContext(UserContext);
    const client = createClient();

    useEffect(() => {
        connectClient(client, 
            () => {
                console.log('Connected to broker');
            },
            (error) => {
                console.error('Connection failed:', error);
            }
        );

        return () => {
            client.disconnect();
        };
    }, []);

    const handleLogout = () => {
        publishMessage(client, 'logout/request', '{}');
        userContext.setUserContext(null);
        navigation.replace('Login');
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Logging out...</Text>
            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
}

export default LogoutScreen;
