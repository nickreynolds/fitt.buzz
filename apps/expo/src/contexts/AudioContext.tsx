import type { AudioSource } from "expo-audio";
import type { ReactNode } from "react";
import React, { createContext, useContext } from "react";
import { useAudioPlayer } from "expo-audio";

// eslint-disable-next-line
const meditationBellSound = require("../../assets/sounds/meditation-bell.mp3");

interface AudioContextType {
  playTimerCompleteSound: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioPlayer = useAudioPlayer(meditationBellSound as AudioSource);

  const playTimerCompleteSound = async () => {
    console.log("playTimerCompleteSound");

    await audioPlayer.seekTo(0);
    audioPlayer.play();
  };

  return (
    <AudioContext.Provider value={{ playTimerCompleteSound }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
