import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const HomeScreen = () => {
  const [connected, setConnected] = useState(false);

  const handleConnect = () => {
    setConnected(!connected);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NNIT VPN</Text>
      <Text style={styles.status}>
        {connected ? 'Connected' : 'Disconnected'}
      </Text>
      
      <TouchableOpacity 
        style={[styles.connectButton, connected && styles.connectedButton]}
        onPress={handleConnect}
      >
        <Text style={styles.buttonText}>
          {connected ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>

      {connected && (
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Download</Text>
            <Text style={styles.statValue}>12.5 MB/s</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Upload</Text>
            <Text style={styles.statValue}>3.2 MB/s</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  status: {
    fontSize: 18,
    marginBottom: 40,
    color: '#666',
  },
  connectButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  connectedButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 40,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default HomeScreen;
