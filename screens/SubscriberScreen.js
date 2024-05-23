import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Client } from 'paho-mqtt';

const SubscriberScreen = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Initialize the client correctly with a string URI and client ID.
    const client = new Client('ws://172.201.117.179:9001/mqtt', 'clientId');

    client.onFailure = (error) => {
      console.error('Connection failed with detailed error:', error);
    };
  

    client.onMessageArrived = (msg) => {
      console.log('New message:', msg.payloadString);
      setMessage(msg.payloadString);
    };

    client.onConnectionLost = responseObject => {
      if (responseObject.errorCode !== 0) {
        console.log('Connection lost:', responseObject.errorMessage);
      }
    };

    client.connect({
      onSuccess: () => {
        console.log('Connection successful');
        client.subscribe('test/topic');
      },
      onFailure: (error) => {
        console.error('Connection failed with error:', error);
      },
      useSSL: false, // true if using 'wss://'
      mqttVersion: 4,
    });

    return () => {
      if (client.isConnected()) {
        client.disconnect();
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MQTT Subscriber</Text>
      <Text style={styles.message}>{message || 'No message received yet'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: 'blue',
  },
});

export default SubscriberScreen;
