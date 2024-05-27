import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Alert } from 'react-native';
import { UserContext } from './components/userContext';

function ChallengesScreen() {
    const { user } = useContext(UserContext);
    const [challenges, setChallenges] = useState([]);
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        fetchChallengesAndRequests();
    }, [user]);

    const fetchChallengesAndRequests = async () => {
        await fetchChallenges();
        await fetchRequests();
    };

    const fetchChallenges = async () => {
        try {
            const response = await fetch(`http://172.201.117.179:3001/users/challenges`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setChallenges(data.challenges);
            } else {
                Alert.alert("Fetch Error", data.message || "Failed to load challenges.");
            }
        } catch (error) {
            console.error('Fetch failed:', error);
            Alert.alert("Fetch Error", "An error occurred while fetching challenges.");
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await fetch(`http://172.201.117.179:3001/users/challenge-requests`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setRequests(data.challenge_requests);
            } else {
                Alert.alert("Fetch Error", data.message || "Failed to load challenge requests.");
            }
        } catch (error) {
            console.error('Fetch failed:', error);
            Alert.alert("Fetch Error", "An error occurred while fetching challenge requests.");
        }
    };

    const handleAccept = async (requestId) => {
        // Implementation for accepting a challenge
    };

    const handleReject = async (requestId) => {
        // Implementation for rejecting a challenge
    };

    const renderChallenge = ({ item }) => (
        <View style={styles.item}>
            <Text style={styles.title}>{item.challengeName}</Text>
            <Text>From: {item.challenger.username}</Text>
            <Text>To: {item.challengedName}</Text>
            <Text>Goal Points: {item.goalPoints}</Text>
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
