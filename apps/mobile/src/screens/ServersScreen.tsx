import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const servers = [
  { id: '1', name: 'US - New York', load: 45 },
  { id: '2', name: 'US - Los Angeles', load: 62 },
  { id: '3', name: 'UK - London', load: 38 },
  { id: '4', name: 'Germany - Frankfurt', load: 71 },
  { id: '5', name: 'Japan - Tokyo', load: 54 },
  { id: '6', name: 'Singapore', load: 29 },
];

const ServersScreen = () => {
  const renderServer = ({ item }: any) => (
    <TouchableOpacity style={styles.serverItem}>
      <View>
        <Text style={styles.serverName}>{item.name}</Text>
        <Text style={styles.serverLoad}>Load: {item.load}%</Text>
      </View>
      <View style={[styles.loadIndicator, { width: `${item.load}%` }]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Server</Text>
      <FlatList
        data={servers}
        renderItem={renderServer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  list: {
    gap: 10,
  },
  serverItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  serverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  serverLoad: {
    fontSize: 14,
    color: '#666',
  },
  loadIndicator: {
    height: 4,
    backgroundColor: '#007AFF',
    marginTop: 10,
    borderRadius: 2,
  },
});

export default ServersScreen;
