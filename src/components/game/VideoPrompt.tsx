"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const UNLOCK_KEY = "stan-game-tv-video-unlocked";

type VideoPromptProps = {
  videoUrl: string;
  playNonce: number;
  stopNonce: number;
};

export function VideoPrompt({ videoUrl, playNonce, stopNonce }: VideoPromptProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pendingPlay, setPendingPlay] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      sessionStorage.getItem(UNLOCK_KEY) === "1"
    ) {
      setUnlocked(true);
    }
  }, []);

  const stopPlayback = useCallback(() => {
    setPlaying(false);
    setPendingPlay(false);
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  const startPlayback = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => {
      setPendingPlay(true);
      setPlaying(false);
    });
    setPlaying(true);
    setPendingPlay(false);
  }, []);

  const unlockAndMaybePlay = useCallback(() => {
    setUnlocked(true);
    sessionStorage.setItem(UNLOCK_KEY, "1");
    if (pendingPlay || playNonce > 0) startPlayback();
  }, [pendingPlay, playNonce, startPlayback]);

  useEffect(() => {
    if (playNonce <= 0) return;
    if (unlocked) startPlayback();
    else setPendingPlay(true);
  }, [playNonce, unlocked, startPlayback]);

  useEffect(() => {
    if (stopNonce > 0) stopPlayback();
  }, [stopNonce, stopPlayback]);

  if (!unlocked) {
    return (
      <button
        type="button"
        onClick={unlockAndMaybePlay}
        className="relative z-10 mx-auto mb-8 block w-full max-w-3xl rounded-3xl border-4 border-amber-400 bg-gradient-to-b from-amber-600/90 to-orange-700/90 px-8 py-14 text-center shadow-2xl"
      >
        <p className="text-5xl">📺</p>
        <p className="mt-4 text-2xl font-black text-white">
          Touchez l&apos;écran pour activer la vidéo
        </p>
        <p className="mt-3 text-violet-100">Une fois par session TV</p>
        {pendingPlay && (
          <p className="mt-4 animate-pulse text-lg font-bold text-lime-200">
            Vidéo en attente — recliquez
          </p>
        )}
      </button>
    );
  }

  return (
    <div className="relative z-10 mx-auto mb-8 w-full max-w-5xl">
      {!playing && (
        <div className="mb-4 rounded-2xl border border-indigo-400/40 bg-indigo-950/30 px-6 py-4 text-center">
          <p className="text-sm font-semibold text-indigo-200">Question vidéo</p>
          <p className="text-xs text-violet-300">
            En attente — le présentateur lance la vidéo
          </p>
        </div>
      )}
      <div className="overflow-hidden rounded-3xl border-4 border-indigo-400 shadow-2xl">
        <video
          ref={videoRef}
          src={videoUrl}
          className="aspect-video w-full bg-black"
          playsInline
          controls={false}
          onEnded={() => setPlaying(false)}
        />
      </div>
    </div>
  );
}

