import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, Modal } from 'react-native';
import { RNCamera } from 'react-native-camera';
import Video from 'react-native-video'; // Make sure to have react-native-video installed
import Value from '../src/components/Value';
import DeviceInfo from 'react-native-device-info';

function ProfileScreen() {
    const [profile, setProfile] = useState({});
    const [isRecording, setIsRecording] = useState(false);
    const [videoUri, setVideoUri] = useState('');
    const [cameraVisible, setCameraVisible] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const cameraRef = useRef(null);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        try {
            const res = await fetch("http://188.230.209.59:3001/users/profile", {
                credentials: "include"
            });
            const data = await res.json();
            setProfile(data);
        } catch (error) {
            console.log('Fetch profile error:', error);
            Alert.alert('Error', 'Unable to fetch profile.');
        }
    };

    const recordVideo = async () => {
        if (cameraRef.current && !isRecording) {
            setIsRecording(true);
            const options = {
                quality: RNCamera.Constants.VideoQuality['480p'],
                maxDuration: 20
            };
            try {
                const data = await cameraRef.current.recordAsync(options);
                setVideoUri(data.uri);
                setIsRecording(false);
                setCameraVisible(false);
                setPreviewVisible(true);
            } catch (error) {
                console.error("Recording Error:", error);
                Alert.alert("Recording Error", "An error occurred while recording.");
                setIsRecording(false);
            }
        }
    };

    const handleRetake = () => {
        setPreviewVisible(false);
        setCameraVisible(true);
    };

    const handleSave = async () => {
        const formData = new FormData();
        formData.append('video', {
            uri: videoUri,
            type: 'video/mp4',
            name: 'upload.mp4'
        });

        try {
            const response = await fetch("http://188.230.209.59:3001/users/uploadVideo", {
                method: "POST",
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.ok) {
                Alert.alert("Upload Successful", "Video uploaded successfully.");
                setPreviewVisible(false);
                setCameraVisible(false);
                sendUUIDToServer();
                getProfile();
            }

        } catch (error) {
            console.error("Upload Error:", error);
            Alert.alert("Upload Error", "Failed to upload video.");
        }
    };

    const sendUUIDToServer = async () => {
        const uuid = await DeviceInfo.getUniqueId();
        console.log('Sending UUID:', uuid);
        console.log('UUID:', uuid);
        try {
            const response = await fetch(`http://188.230.209.59:3001/users`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneUUID: uuid })
            });
            if (response.ok) {
                const updatedUser = await response.json();
                setProfile(updatedUser);
                Alert.alert("Update Successful", "Your device ID has been updated.");
            } else {
                throw new Error('Failed to update UUID on server');
            }
        } catch (error) {
            console.error('Error updating UUID:', error);
            Alert.alert("Update Failed", "Could not update your device ID on the server.");
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <Text>Profile</Text>
            <Value label="Username" value={profile.username} />
            {(!profile.phoneUUID || profile.phoneUUID === "") && (
                <Button title="Open Camera" onPress={() => setCameraVisible(true)} />
            )}
            {cameraVisible && (
                <RNCamera
                    ref={cameraRef}
                    style={{ flex: 1 }}
                    type={RNCamera.Constants.Type.front}
                >
                    <Button title="Record Video" onPress={recordVideo} />
                </RNCamera>
            )}
            {previewVisible && (
                <Modal visible={previewVisible} animationType="slide">
                    <Video
                        source={{ uri: videoUri }}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode="cover"
                        shouldPlay
                        isLooping
                        style={{ width: 300, height: 300 }}
                    />
                    <Button title="Retake" onPress={handleRetake} />
                    <Button title="Save Video" onPress={handleSave} />
                </Modal>
            )}
        </View>
    );
}

export default ProfileScreen;
