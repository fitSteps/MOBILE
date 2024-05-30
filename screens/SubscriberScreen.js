import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { MQTTContext } from '../mqttProvider';
import { UserContext } from './components/userContext';

const SubscriberScreen = () => {
  const [message, setMessage] = useState('');
  const { client } = useContext(MQTTContext);  
  const userContext = useContext(UserContext);
  const [uuid, setUUID] = useState('');
  const [showAuthenticateButton, setShowAuthenticateButton] = useState(false);

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
      const topic = `topic/${uuid}`;
      client.onMessageArrived = (msg) => {
        console.log('Received msg:', msg.payloadString);
        setMessage(msg.payloadString);
        if (msg.payloadString === "authenticate") {
          setShowAuthenticateButton(true);
        } else {
          setShowAuthenticateButton(false);
        }
      };

      client.subscribe(topic, {
        onSuccess: () => console.log(`Subscribed to ${topic}!`)
      });

      return () => {
        if (client.isConnected()) {
          client.unsubscribe(topic);
        }
      };
    }
  }, [client, uuid]);

  const handleAuthenticate = () => {
    if (client && client.isConnected()) {
        const topic = `topic/${uuid}`;  // Ensure the topic is defined based on current UUID
        const message = 'Authenticated';  // Define the text you want to send
        
        client.publish(topic, message, 1, false);


    } else {
        console.log('Client is not connected.');
        Alert.alert("Connection Error", "Cannot connect to MQTT broker.");
    }
};

  return (
    <View style={styles.container}>
      {uuid !== '' && !showAuthenticateButton && (
          <Text style={styles.title}>Waiting for requests</Text>
      )}
      
      {showAuthenticateButton && (
        <Button
          title="Authenticate"
          onPress={handleAuthenticate}
        />
      )}
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
