import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { RNCamera } from 'react-native-camera';
import Video from 'react-native-video'; // Make sure to have react-native-video installed
import Value from '../src/components/Value';
import DeviceInfo from 'react-native-device-info';
import { UserContext } from './components/userContext';


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
                type: RNCamera.Constants.Type.back,
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
        <View style={styles.container}>
            {cameraVisible ? (
                <RNCamera
                    ref={cameraRef}
                    style={styles.fullScreenCamera}
                    type={RNCamera.Constants.Type.front}
                >
                    <View style={styles.cameraControl}>
                        <TouchableOpacity style={styles.button} onPress={recordVideo}>
                            <Text style={styles.buttonText}>Record Video</Text>
                        </TouchableOpacity>
                    </View>
                </RNCamera>
            ) : (
                // Render other UI elements when camera is not active
                <>
                    <Value label="Username" value={profile.username} />
                    <Value label="Email" value={profile.email} />
                    <Value label="Created" value={profile.dateOfCreating} />
                    <Value label="Points" value={profile.points} />
                    {(!profile.phoneUUID || profile.phoneUUID === "") && (
                        <TouchableOpacity style={styles.button} onPress={() => setCameraVisible(true)}>
                            <Text style={styles.buttonText}>Open Camera</Text>
                        </TouchableOpacity>
                    )}
                </>
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
                        style={styles.videoPreview}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleRetake}>
                        <Text style={styles.buttonText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={handleSave}>
                        <Text style={styles.buttonText}>Save Video</Text>
                    </TouchableOpacity>
                </Modal>
            )}
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    fullScreenCamera: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    cameraControl: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        padding: 10,
        position: 'absolute',
        bottom: 20,
        width: '100%',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    videoPreview: {
        width: 300,
        height: 300,
    }
});
export default ProfileScreen;
