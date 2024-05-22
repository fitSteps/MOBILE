import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import createClient, { connectClient, publishMessage } from '../mqttClient';

function RegisterScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
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

    const handleRegister = () => {
        publishMessage(client, 'register/request', JSON.stringify({
            username, password, email
        }));
        // Navigate on successful registration, consider MQTT response
        navigation.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Register" onPress={handleRegister} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    }
});

export default RegisterScreen;
