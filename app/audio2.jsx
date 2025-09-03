import { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Tts from 'react-native-tts';

export default function audio2() {
  const [text, setText] = useState('Welcome to React Native Text-to-Speech. This is a sample passage. You can rewind or skip ahead by 10 seconds.');
  const [chunks, setChunks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [rate, setRate] = useState(0.5);
  const [pitch, setPitch] = useState(1.0);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Split text into chunks (sentences)
    const sentences = text.split(/([.?!])\s+/).filter(Boolean);
    setChunks(sentences);

    // Init TTS
    Tts.getInitStatus().then(() => {
      Tts.voices().then(availableVoices => {
        setVoices(availableVoices.filter(v => !v.notInstalled));
      });
    }).catch(() => {
      Alert.alert('TTS Error', 'Initialization failed');
    });

    // Listeners
    Tts.addEventListener('tts-start', () => setIsSpeaking(true));
    Tts.addEventListener('tts-finish', () => {
      setIsSpeaking(false);
      setCurrentIndex(i => Math.min(i + 1, chunks.length - 1)); // auto move forward
    });
    Tts.addEventListener('tts-cancel', () => setIsSpeaking(false));

return () => {
  Tts.removeAllListeners('tts-start');
  Tts.removeAllListeners('tts-finish');
  Tts.removeAllListeners('tts-cancel');
  Tts.stop();
};

  }, [text]);

  const speakFromIndex = (index) => {
    if (chunks.length === 0) return;

    Tts.stop();
    Tts.setDefaultRate(rate);
    Tts.setDefaultPitch(pitch);
    if (selectedVoice) Tts.setDefaultVoice(selectedVoice);

    setCurrentIndex(index);
    for (let i = index; i < chunks.length; i++) {
      Tts.speak(chunks[i]);
    }
  };

  const speak = () => speakFromIndex(currentIndex);
  const stop = () => Tts.stop();

  const back10s = () => {
    let newIndex = Math.max(currentIndex - 1, 0);
    speakFromIndex(newIndex);
  };

  const forward10s = () => {
    let newIndex = Math.min(currentIndex + 1, chunks.length - 1);
    speakFromIndex(newIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Text-to-Speech</Text>

      <ScrollView>
        <TextInput
          style={styles.textInput}
          multiline
          value={text}
          onChangeText={setText}
        />
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#2ecc71' }]} onPress={speak}>
          <Text style={styles.buttonText}>{isSpeaking ? 'Speaking...' : 'Speak'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={stop}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#3498db' }]} onPress={back10s}>
          <Text style={styles.buttonText}>⏪ 10s</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#9b59b6' }]} onPress={forward10s}>
          <Text style={styles.buttonText}>⏩ 10s</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#ecf0f1' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  textInput: { borderWidth: 1, padding: 10, borderRadius: 8, backgroundColor: '#fff', minHeight: 100 },
  controls: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 20, gap: 10 },
  button: { padding: 12, borderRadius: 20, minWidth: 90, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});
