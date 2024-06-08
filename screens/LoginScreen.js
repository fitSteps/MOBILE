import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { UserContext } from './components/userContext'; // Adjust the import based on where you place the context
import DeviceInfo from 'react-native-device-info';


function LoginScreen({ navigation }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const userContext = useContext(UserContext);
    const uuid =  DeviceInfo.getUniqueId();

    async function handleLogin(e) {
        e.preventDefault();
        const res = await fetch("http://188.230.209.59:3001/users/login", {
            method: "POST",
            credentials: "include",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                password: password,
                phoneUUID: uuid //{ _j: "24a1d601ca7c05b3"}
            })
        });
        const data = await res.json();
        if(data._id !== undefined){
            userContext.setUserContext(data);
            console.log("dela",data._id);
            navigation.replace('Main');
        } else {
            setUsername("");
            setPassword("");
            setError("Invalid username or password");
        }
    }

    return (
        <View style={styles.container}>
        {userContext.user ? navigation.replace('Home') : null}
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
            <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={handleLogin}>
                <Text style={styles.buttonText}>Log in</Text>
            </TouchableOpacity>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.registerContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerButton}>Don't have an account yet?</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F8F8F8',
    },
    input: {
        height: 48,
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 15,
        borderColor: '#E0E0E0',
        borderWidth: 1,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        width: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    error: {
        color: 'red',
        fontSize: 14,
        marginTop: 10,
        width: '90%',
        textAlign: 'center',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    registerButton: {
        fontSize: 14,
        color: '#007AFF', // Matching the button color for a consistent look
        fontWeight: '600',
    }
});

export default LoginScreen;
