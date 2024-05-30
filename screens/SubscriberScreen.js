import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { MQTTContext } from '../mqttProvider';
import { UserContext } from './components/userContext';

const SubscriberScreen = () => {
  const [message, setMessage] = useState('');
  const { client } = useContext(MQTTContext);  
  const userContext = useContext(UserContext);
  const [uuid, setUUID] = useState('');
  const [showAuthenticateButton, setShowAuthenticateButton] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const cameraRef = useRef(null);

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
    setCameraVisible(true); // Open the camera to take a photo
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true, orientation: 'portrait' };
      const data = await cameraRef.current.takePictureAsync(options);
      console.log(data.uri);
      uploadPhoto(data.uri);
    }
  };

  const uploadPhoto = async (uri) => {
    const formData = new FormData();
    formData.append('photo', {
      uri: uri,
      type: 'image/jpeg',
      name: 'authentication.jpg'
    });

    try {
      const response = await fetch("http://172.201.117.179:3001/users/uploadPhoto", {
        method: "POST",
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });

      if (response.ok) {
        Alert.alert("Upload Successful", "Photo uploaded successfully.");
        setCameraVisible(false);
        approveAuthenticate();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Upload Error", "Failed to upload photo.");
      setCameraVisible(false);
    }
  };

  const approveAuthenticate = () => {
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

      {cameraVisible && (
        <RNCamera
          ref={cameraRef}
          style={styles.preview}
          type={RNCamera.Constants.Type.front}
          captureAudio={false}
        >
          <Button title="Take Photo" onPress={takePicture} />
        </RNCamera>
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
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '100%',
    width: '100%'
  }
});

export default SubscriberScreen;
