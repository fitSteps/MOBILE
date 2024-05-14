import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function Header({ title }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    padding: 15,
    backgroundColor: 'dodgerblue'
  },
  text: {
    textAlign: 'center',
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  }
});

export default Header;
