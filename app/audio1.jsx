import { Entypo } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useEffect, useRef, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Tts from "react-native-tts";

export default function TextReader() {
  const [text, setText] = useState(
    "In the beginning was the Word, and the Word was with God, and the Word was God."
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [resumeOffset, setResumeOffset] = useState(0);

  const progressInterval = useRef(null);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  /** Cleanup timer */
  const cleanupProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  useEffect(() => {
    Tts.getInitStatus();

    const startSub = Tts.addEventListener("tts-start", () => {
      setIsSpeaking(true);
      setIsPaused(false);
    });
    const finishSub = Tts.addEventListener("tts-finish", () => {
      setIsSpeaking(false);
      setIsPaused(false);
      cleanupProgress();
      setProgress(1);
    });
    const cancelSub = Tts.addEventListener("tts-cancel", () => {
      setIsSpeaking(false);
      setIsPaused(false);
      cleanupProgress();
    });

    return () => {
      startSub.remove();
      finishSub.remove();
      cancelSub.remove();
      Tts.stop();
      cleanupProgress();
    };
  }, []);

  /** Start or resume speaking */
  const speak = (resume = false) => {
    Tts.stop();
    cleanupProgress();

    const estimatedDuration = Math.max(2000, text.length * 50); // ~50ms per char
    setTotalTime(estimatedDuration);

    let startText = text;
    if (resume && resumeOffset > 0) {
      const cutIndex = Math.floor(
        (resumeOffset / estimatedDuration) * text.length
      );
      startText = text.slice(cutIndex);
    }

    const start = Date.now() - resumeOffset;

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - start;
      setElapsedTime(Math.min(elapsed, estimatedDuration));
      setProgress(Math.min(elapsed / estimatedDuration, 1));
    }, 200);

    Tts.speak(startText);
  };

  /** Play / Pause */
  const togglePlayPause = () => {
    if (isSpeaking) {
      // Pause
      Tts.stop();
      cleanupProgress();
      setIsSpeaking(false);
      setIsPaused(true);
      setResumeOffset(elapsedTime);
    } else if (isPaused) {
      // Resume
      speak(true);
    } else {
      // Fresh start
      setElapsedTime(0);
      setResumeOffset(0);
      speak();
    }
  };

  /** Seek backward */
  const back10s = () => {
    const newOffset = Math.max(0, elapsedTime - 10000);
    setElapsedTime(newOffset);
    setResumeOffset(newOffset);
    speak(true);
  };

  /** Seek forward */
  const forward10s = () => {
    const newOffset = Math.min(totalTime, elapsedTime + 10000);
    setElapsedTime(newOffset);
    setResumeOffset(newOffset);
    speak(true);
  };

  /** Slider seek */
  const onSeek = (value) => {
    const newOffset = Math.floor(value * totalTime);
    setElapsedTime(newOffset);
    setResumeOffset(newOffset);
    speak(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Text content */}
      <ScrollView style={{ flex: 1 }}>
        <Text style={styles.heading}>John 1</Text>
        <TextInput
          style={styles.text}
          multiline
          value={text}
          onChangeText={setText}
        />
      </ScrollView>

      {/* Floating Player */}
      <View style={styles.player}>
        <Text style={styles.narrator}>English Narrator (Default)</Text>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={back10s}>
            <Entypo name="controller-fast-backward" size={32} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
            <Entypo
              name={isSpeaking ? "controller-pause" : "controller-play"}
              size={32}
              color="#000"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={forward10s}>
            <Entypo name="controller-fast-forward" size={32} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.time}>{formatTime(elapsedTime)}</Text>
          <Slider
            style={{ flex: 1, marginHorizontal: 10 }}
            minimumValue={0}
            maximumValue={1}
            value={progress}
            onSlidingComplete={onSeek}
            minimumTrackTintColor="#000"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#000"
          />
          <Text style={styles.time}>
            -{formatTime(Math.max(totalTime - elapsedTime, 0))}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },
  text: {
    fontSize: 18,
    padding: 16,
    lineHeight: 26,
  },
  player: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  narrator: {
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 10,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    marginVertical: 10,
  },
  playButton: {
    backgroundColor: "#eee",
    borderRadius: 40,
    padding: 16,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  time: { fontSize: 12, color: "#444" },
});
