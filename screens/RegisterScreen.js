import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity, StyleSheet } from 'react-native';

function RegisterScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [error, setError] = useState('');

    async function handleRegister() {
        const res = await fetch("http://188.230.209.59:3001/users", {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                username: username,
                password: password,
                height: height,
                weight: weight
            })
        });
        const data = await res.json();
        if (data._id !== undefined) {
            navigation.navigate('Login');
        } else {
            setUsername("");
            setPassword("");
            setEmail("");
            setHeight("");
            setWeight("");
            setError("Registration failed");
        }
    }

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
            <TextInput
                style={styles.input}
                placeholder="Height"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Weight"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={handleRegister}>
                <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F2F1F6',
        padding: 20,
    },
    input: {
        height: 48,
        width: '90%',  // Full width of the screen with some margin
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0', // Very light border for depth
    },
    button: {
        backgroundColor: '#007AFF', // iOS default blue
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',  // Ensuring the button is not too wide
    },
    buttonText: {
        color: '#FFFFFF',  // White color for the text
        fontSize: 16,
        fontWeight: '600',  // Semi-bold for iOS
    },
    error: {
        color: 'red',
        fontSize: 14,
        marginTop: 10,
        width: '90%',
        textAlign: 'center', // Center error messages
    }
});




export default RegisterScreen;
