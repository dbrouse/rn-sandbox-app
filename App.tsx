import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,  
} from 'react-native';
import Draw from './Draw';

function App(): React.JSX.Element {

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.page}
        >
          <Text style={styles.h2}>Write Hello ...</Text>
          <Draw />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  page: {
    flex: 1,
    padding: 50,
  },
  h2: {
    fontSize: 25,
    fontWeight: '500',
    marginBottom: 10,
  },
});

export default App;
