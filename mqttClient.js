import init from 'react_native_mqtt';
import AsyncStorage from '@react-native-async-storage/async-storage';

init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

// Your MQTT client setup continues...


init({
  size: 10000,
  storageBackend: AsyncStorage,
  defaultExpires: 1000 * 3600 * 24,
  enableCache: true,
  reconnect: true,
  sync: {},
});

const createClient = () => {
  const client = new Paho.MQTT.Client('broker.hivemq.com', 8000, 'clientId');

  client.onConnectionLost = responseObject => {
    if (responseObject.errorCode !== 0) {
      console.log('Connection lost:', responseObject.errorMessage);
    }
  };

  client.onMessageArrived = message => {
    console.log('New message:', message.payloadString);
  };

  return client;
};

export const connectClient = (client, onSuccess, onFailure) => {
  client.connect({
    onSuccess,
    onFailure,
    useSSL: false,
    userName: 'username',
    password: 'password',
  });
};

export const disconnectClient = (client) => {
  if (client.isConnected()) {
    client.disconnect();
  }
};

export const subscribeToTopic = (client, topic) => {
  if (client.isConnected()) {
    client.subscribe(topic);
  }
};

export const publishMessage = (client, topic, message) => {
  const mqttMessage = new Paho.MQTT.Message(message);
  mqttMessage.destinationName = topic;
  client.send(mqttMessage);
};

export default createClient;
