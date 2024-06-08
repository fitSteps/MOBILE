import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Button, Modal, TextInput,Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserContext } from './components/userContext';

function Friends() {
    const [friends, setFriends] = useState([]);
    const { user } = useContext(UserContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [goalPoints, setGoalPoints] = useState('');
    const [dateFrom, setDateFrom] = useState(new Date());
    const [showDatePickerFrom, setShowDatePickerFrom] = useState(false);

    useEffect(() => {
        if (user) {
            fetchFriends();
        }
    }, [user]);
    
    const fetchFriends = async () => {
        console.log("Fetching friends for user:", user);
        try {
            const response = await fetch('http://188.230.209.59:3001/users/friends', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            console.log("Response:", response);
            if (response.ok) {
                const friends = await response.json();
                const updatedFriends = friends.map(friend => {
                    const isChallenged = friend.challenges.some(challenge => 
                        challenge.challenger === user._id || challenge.challenged === user._id);
                    const hasChallengeRequest = friend.challenge_requests.some(request => 
                        request.challenger === user._id || request.challenged === user._id);
                    return { ...friend, isChallenged, hasChallengeRequest };
                });
                console.log("Data received:", updatedFriends);
                setFriends(updatedFriends);
            } else {
                console.error('Failed to fetch friends:', response.statusText);
            }
        } catch (error) {
            console.error('Fetch failed:', error);
        }
    };
    
    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.username}>{item.username}</Text>
            <Text>{item.email}</Text>
            {!item.isChallenged && !item.hasChallengeRequest && (
                <Button title="Challenge" onPress={() => {
                    setSelectedFriend(item);
                    setModalVisible(true);
                }} />
            )}
        </View>
    );

    const handleChallengeSubmit = async () => {
        const submitData = {
            challengerId: user._id,
            challengedId: selectedFriend._id,
            goalPoints,
            dateFrom: dateFrom.toISOString(),
        };
    
        console.log('Submitting challenge for:', selectedFriend.username, 'with data:', submitData);
    
        try {
            const response = await fetch('http://188.230.209.59:3001/challenges/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify(submitData)
            });
    
            const data = await response.json();
            if (response.ok) {
                console.log("Challenge submitted successfully:", data);
                alert("Challenge submitted successfully!");
                fetchFriends();  // Refetch friends to update state immediately
                setModalVisible(false);
            } else {
                throw new Error(data.message || "Failed to submit challenge due to server error");
            }
        } catch (error) {
            console.error('Failed to submit challenge:', error);
            alert(`Error: ${error.message || error}`);
        }
    };
    

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Friends List</Text>
            <FlatList
                data={friends}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text style={styles.username}>{item.username}</Text>
                        <Text>{item.email}</Text>
                        {!item.isChallenged && !item.hasChallengeRequest && (
                            <TouchableOpacity style={styles.button} onPress={() => {
                                setSelectedFriend(item);
                                setModalVisible(true);
                            }}>
                                <Text style={styles.buttonText}>Challenge</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => <Text>You have no friends.</Text>}
            />
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TextInput
                            placeholder="Goal Points"
                            value={goalPoints}
                            onChangeText={setGoalPoints}
                            style={styles.input}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.button} onPress={handleChallengeSubmit}>
                            <Text style={styles.buttonText}>Submit Challenge</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
        paddingHorizontal: 10,
        backgroundColor: '#f0f0f0',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    item: {
        backgroundColor: '#ffffff',
        padding: 20,
        marginVertical: 8,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent background
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    input: {
        width: 200,
        height: 40,
        marginBottom: 12,
        borderWidth: 1,
        padding: 10,
        borderColor: '#ccc',
        borderRadius: 5,
    },
});

export default Friends;
