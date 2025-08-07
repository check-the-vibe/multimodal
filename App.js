import React, { useState } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet, StatusBar, Dimensions } from 'react-native';

const inputModalities = ['Text', 'Image', 'Audio'];
const outputModalities = ['Text', 'Image', 'Audio'];

const { width } = Dimensions.get('window');

export default function App() {
  const [input, setInput] = useState(inputModalities[0]);
  const [output, setOutput] = useState(outputModalities[0]);

  const renderItem = (item) => (
    <View style={styles.page}>
      <Text style={styles.pageText}>{item}</Text>
    </View>
  );

  const handleInputScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setInput(inputModalities[index]);
  };

  const handleOutputScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setOutput(outputModalities[index]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Input: {input}</Text>
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={inputModalities}
        keyExtractor={(item) => item}
        onMomentumScrollEnd={handleInputScroll}
        renderItem={({ item }) => renderItem(item)}
      />
      <Text style={styles.heading}>Output: {output}</Text>
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={outputModalities}
        keyExtractor={(item) => item}
        onMomentumScrollEnd={handleOutputScroll}
        renderItem={({ item }) => renderItem(item)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
    backgroundColor: '#fff'
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    textAlign: 'center'
  },
  page: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  pageText: {
    fontSize: 24
  }
});
