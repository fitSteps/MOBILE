import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet,TouchableOpacity, Button, Alert, Image } from 'react-native';
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
  const [photoUri, setPhotoUri] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const getUUID = async () => {
      try {
        const res = await fetch("http://188.230.209.59:3001/users/profile", { credentials: "include" });
        const data = await res.json();
        setUUID(data.phoneUUID);
      } catch (error) {
        console.log('Fetch profile error:', error);
        Alert.alert('Error', 'Unable to fetch profile.');
      }
    };

    getUUID();
  }, []);

  useEffect(() => {
    if (client && uuid) {
      const topic = `topic/${userContext.user._id}`;
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
    setCameraVisible(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true, orientation: 'portrait' };
      const data = await cameraRef.current.takePictureAsync(options);
      console.log(data.uri);
      setPhotoUri(data.uri);
      setCameraVisible(false);
    }
  };

  const uploadPhoto = async () => {
    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'authentication.jpg'
    });

    try {
      const response = await fetch("http://188.230.209.59:3001/users/uploadPhoto", {
        method: "POST",
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        },
      });

      if (response.ok) {
        Alert.alert("Upload Successful", "Photo uploaded successfully.");
        setPhotoUri(null); // Clear the photo URI after upload
        approveAuthenticate();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Upload Error", "Failed to upload photo.");
    }
  };

  const approveAuthenticate = () => {
    if (client && client.isConnected()) {
      const topic = `topic/${userContext.user._id}`;  // Ensure the topic is defined based on current UUID
      const message = 'Slika je bva usesno uplodana';  // Define the text you want to send
      
      client.publish(topic, message, 1, false);

    } else {
      console.log('Client is not connected.');
      Alert.alert("Connection Error", "Cannot connect to MQTT broker.");
    }
  };

  const retakePhoto = () => {
    setPhotoUri(null); // Clear the photo URI to retake the photo
    setCameraVisible(true); // Show the camera again
  };

  return (
    <View style={styles.container}>
      {uuid !== '' && !showAuthenticateButton && !cameraVisible && !photoUri && (
        <Text style={styles.title}>Waiting for requests...</Text>
      )}

      {showAuthenticateButton && !cameraVisible && !photoUri && (
        <TouchableOpacity style={styles.button} onPress={handleAuthenticate}>
          <Text style={styles.buttonText}>Authenticate</Text>
        </TouchableOpacity>
      )}

      {cameraVisible && (
        <RNCamera
          ref={cameraRef}
          style={styles.preview}
          type={RNCamera.Constants.Type.front}
          captureAudio={false}
        >
          <View style={styles.cameraControl}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </RNCamera>
      )}

      {photoUri && (
        <View style={styles.photoContainer}>
          <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          <TouchableOpacity style={styles.button} onPress={uploadPhoto}>
            <Text style={styles.buttonText}>Upload Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={retakePhoto}>
            <Text style={styles.buttonText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#f0f0f0', // Light background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50', // Darker text for better visibility
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  cameraControl: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
  },
  photoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  photoPreview: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
});

export default SubscriberScreen;
