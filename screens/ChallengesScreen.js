import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import { UserContext } from './components/userContext';
import { MQTTContext } from '../mqttProvider';


function ChallengesScreen() {
    const { user } = useContext(UserContext);
    const { client } = useContext(MQTTContext);
    const userContext = useContext(UserContext);
    const [challenges, setChallenges] = useState([]);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const abortController = new AbortController();

        if (user) {
            fetchChallengesAndRequests(abortController.signal);
            // Subscribe to MQTT for updates
            if (client) {
                const topic = `challenges/updates/${userContext.user._id}`;
                console.log(userContext.user._id)
                client.subscribe(topic);

                client.onMessageArrived = (message) => {
                    const updatedData = JSON.parse(message.payloadString);
                    console.log(updatedData,);
                    updateChallenges(updatedData);
                };
            }
        }
        
        return () => {
            abortController.abort();
            if (client) {
                client.unsubscribe(`challenges/updates/${user.userId}`);
            }
        };

        return () => abortController.abort(); // Cleanup function that aborts the fetch when the component unmounts
    }, [user]);

    const fetchChallengesAndRequests = async (signal) => {
        await fetchChallenges(signal);
        await fetchRequests(signal);
    };
    const updateChallenges = async (data) => {
        // Assuming 'data' includes 'userId' and 'points'
    
        try {
            const response = await fetch('http://188.230.209.59:3001/challenges/update-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    credentials: 'include'

                },
                body: JSON.stringify({
                    userId: data.userId,
                    points: data.points
                })
            });
            const responseData = await response.json();
            console.log(responseData.message); // Log the server's response
    
            if (response.ok) {
                // Assuming the server returns the updated challenge(s) in the response
                setChallenges(prevChallenges => prevChallenges.map(challenge => {
                    if (challenge._id === responseData.challenge._id) {
                        return responseData.challenge; // Replace with updated challenge from server
                    }
                    return challenge;
                }));
            } else {
                throw new Error(responseData.message || 'Failed to update challenge points on server.');
            }
        } catch (error) {
            console.error('Failed to update points on server:', error);
            // Optionally handle error state in UI
        }
    };
    
    
    

    const fetchChallenges = async (signal) => {
        try {
            const response = await fetch(`http://188.230.209.59:3001/users/challenges`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                signal: signal
            });
            const data = await response.json();
            if (response.ok) {
                setChallenges(data.challenges);
            } else {
                Alert.alert("Fetch Error", data.message || "Failed to load challenges.");
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Fetch failed:', error);
                Alert.alert("Fetch Error", "An error occurred while fetching challenges.");
            }
        }
    };

    const fetchRequests = async (signal) => {
        try {
            const response = await fetch(`http://188.230.209.59:3001/users/challenge-requests`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                signal: signal
            });
            const data = await response.json();
            if (response.ok) {
                setRequests(data.challenge_requests);
            } else {
                Alert.alert("Fetch Error", data.message || "Failed to load challenge requests.");
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Fetch failed:', error);
                Alert.alert("Fetch Error", "An error occurred while fetching challenge requests.");
            }
        }
    };

    const handleAccept = async (challengeId) => {
        try {
            const response = await fetch(`http://188.230.209.59:3001/users/accept/${challengeId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert("Challenge Accepted", data.message);
                fetchChallengesAndRequests(); // Refresh the lists
            } else {
                Alert.alert("Error", data.message);
            }
        } catch (error) {
            console.error('Accept failed:', error);
            Alert.alert("Accept Error", "An error occurred while accepting the challenge.");
        }
    };
    
    const handleReject = async (challengeId) => {
        try {
            const response = await fetch(`http://188.230.209.59:3001/users/reject/${challengeId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert("Challenge Rejected", data.message);
                fetchChallengesAndRequests(); // Refresh the lists
            } else {
                Alert.alert("Error", data.message);
            }
        } catch (error) {
            console.error('Reject failed:', error);
            Alert.alert("Reject Error", "An error occurred while rejecting the challenge.");
        }
    };
    

    const renderChallenge = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.title}>{item.challengeName}</Text>
            <Text>Goal Points: {item.goalPoints}</Text>
            <Text>{item.challenger.username}s points: {item.challengerPoints}</Text>
            <Text>{item.challenged.username}s points: {item.challengedPoints}</Text>
            <Text>Started: {item.dateFrom}</Text>
            <Text>Ends: {item.dateTo}</Text>
        </View>
    );

    const renderRequest = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.title}>{item.challengeName}</Text>
            <Text>From: {item.challenger.username}</Text>
            <Text>Goal Points: {item.goalPoints}</Text>
            <View style={styles.buttons}>
                <Button title="Accept" onPress={() => handleAccept(item._id)} />
                <Button title="Reject" onPress={() => handleReject(item._id)} />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Ongoing Challenges</Text>
            <FlatList
                data={challenges}
                renderItem={renderChallenge}
                keyExtractor={item => item._id.toString()}
            />
            <Text style={styles.header}>Challenge Requests</Text>
            <FlatList
                data={requests}
                renderItem={renderRequest}
                keyExtractor={item => item._id.toString()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
        paddingHorizontal: 10
    },
    item: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        marginVertical: 8
    },
    title: {
        fontSize: 18
    },
    header: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    }
});

export default ChallengesScreen;
