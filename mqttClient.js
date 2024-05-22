import AsyncStorage from '@react-native-async-storage/async-storage';
import init from 'react_native_mqtt';

// Initialize with AsyncStorage to prevent data loss warnings
init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

const createClient = () => {
  const client = new Paho.MQTT.Client('108.143.161.80', 1883, 'clientId');

  client.onConnectionLost = responseObject => {
    if (responseObject.errorCode !== 0) {
      console.log('Connection lost:', responseObject.errorMessage);
    }
  };

  client.onMessageArrived = message => {
    console.log('New message:', message.payloadString);
  };

  client.connect({
    onSuccess: () => {
      console.log('Connection successful');
      // Ensure subscription and publishing are done here or after this point
      client.subscribe('yourTopic');
      publishMessage(client);
    },
    onFailure: (error) => {
      console.error('Connection failed:', error);
    },
    useSSL: false, // Use true if your broker is set up for SSL/TLS
    userName: 'username',
    password: 'password',
  });

  return client;
};

function publishMessage(client) {
  if (client.isConnected()) {
    const message = new Paho.MQTT.Message("Hello MQTT");
    message.destinationName = "yourTopic";
    client.send(message);
  } else {
    console.log('Client is not connected, cannot publish.');
  }
}

export default createClient;
