import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { UserContext } from './components/userContext';

function Friends() {
    const [friends, setFriends] = useState([]);
    const { user } = useContext(UserContext);

    useEffect(() => {
        if (user) {
            fetchFriends();
        }
    }, [user]);
    
    
    const fetchFriends = async () => {
        console.log("Fetching friends for user:", user);
        try {
            const response = await fetch('http://172.201.117.179:3001/users/friends', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            console.log("Response:", response);
            if (response.ok) {
                const data = await response.json();
                console.log("Data received:", data);
                setFriends(data);
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
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Friends List</Text>
            <FlatList
                data={friends}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                ListEmptyComponent={() => <Text>You have no friends.</Text>} // Updated to return a component function
            />
        </View>
    );
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 50,
        paddingHorizontal: 10
    },
    header: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20
    },
    item: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        marginVertical: 8
    },
    username: {
        fontSize: 18
    }
});

export default Friends;
