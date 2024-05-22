import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { UserContext } from './components/userContext';
import createClient, { connectClient, publishMessage, subscribeToTopic } from '../mqttClient';

function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const userContext = useContext(UserContext);

  const client = createClient();

  useEffect(() => {
    connectClient(client, 
      () => {
        console.log('Connected to broker');
        subscribeToTopic(client, 'login/response');
      },
      (error) => {
        console.error('Connection failed:', error);
      }
    );

    return () => {
      client.disconnect();
    };
  }, []);

  async function handleLogin() {
    publishMessage(client, 'login/request', JSON.stringify({ username, password }));
    // Assuming the response handler updates the context or navigates
  }

  return (
    <View style={styles.container}>
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
  }
});

export default LoginScreen;
