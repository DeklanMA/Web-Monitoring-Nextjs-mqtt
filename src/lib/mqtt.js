import { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const brokerUrl =
  'wss://c359d23a2af341e5857e041d723e4284.s1.eu.hivemq.cloud:8884/mqtt';
const username = 'web_iot';
const password = 'Web_monitoring1';

function useMQTTConnection() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    const options = {
      username,
      password,
    };
    const mqttClient = mqtt.connect(brokerUrl, options);

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
    });

    mqttClient.on('error', (error) => {
      console.error('MQTT connection error:', error);
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, []);

  return client;
}

export default useMQTTConnection;
