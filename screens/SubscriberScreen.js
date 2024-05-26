import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MQTTContext } from '../mqttProvider';  // Import the context
import { UserContext } from './components/userContext';

const SubscriberScreen = () => {
  const [message, setMessage] = useState('');
  const { client } = useContext(MQTTContext);  
  const userContext = useContext(UserContext);
  const [uuid, setUUID] = useState({});

  useEffect(() => {
    const getUUID = async () => {
      try {
        const res = await fetch("http://172.201.117.179:3001/users/profile", { credentials: "include" });
        const data = await res.json();
        setUUID(data.phoneUUID);  // Save the UUID in state
      } catch (error) {
        console.log('Fetch profile error:', error);
        Alert.alert('Error', 'Unable to fetch profile.');
      }
    };

    getUUID();
  }, []); 

  useEffect(() => {
    if (client && uuid) {
      const topic = `topic/${uuid}`;  // Create a topic string using the UUID
      client.onMessageArrived = (msg) => {
        console.log('New message:', msg.payloadString);
        setMessage(msg.payloadString);  // Update the local state with the received message
      };

      // Subscribe to the topic specific to the UUID
      client.subscribe(topic, {
        onSuccess: () => console.log(`Subscribed to ${topic}!`)
      });

      return () => {
        if (client.isConnected()) {
          client.unsubscribe(topic);
        }
      };
    }
  }, [client, uuid]);  // This effect runs when either client or uuid changes

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
