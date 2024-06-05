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
            <Button title="Log in" onPress={handleLogin} />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.registerContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.registerButton}>Don't have an account yet? </Text>
                </TouchableOpacity>
            </View>
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
    },
    error: {
        color: 'red',
        marginTop: 10,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    registerText: {
        fontSize: 14,
    },
    registerButton: {
        fontSize: 14,
        color: 'blue',
    }
});

export default LoginScreen;
