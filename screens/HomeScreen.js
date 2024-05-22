import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { UserContext } from './components/userContext';
import createClient, { connectClient, subscribeToTopic, publishMessage } from '../mqttClient';

function HomeScreen({ navigation }) {
    const userContext = useContext(UserContext);
    const [profile, setProfile] = useState({});
    const client = createClient();

    useEffect(() => {
        connectClient(client,
            () => {
                console.log('Connected to broker');
                subscribeToTopic(client, 'profile/response');
                publishMessage(client, 'profile/request', '{}');
            },
            (error) => {
                console.error('Connection failed:', error);
            }
        );

        return () => {
            client.disconnect();
        };
    }, []);

    return (
        <View style={styles.container}>
            <Text>User Profile:</Text>
            <Text>{JSON.stringify(profile)}</Text>
            <Button title="Update Profile" onPress={() => publishMessage(client, 'profile/update', JSON.stringify(profile))} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    }
});

export default HomeScreen;
