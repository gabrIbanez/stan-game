"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const UNLOCK_KEY = "stan-game-tv-audio-unlocked";

type MusicalBlindTestProps = {
  audioUrl: string;
  playNonce: number;
  stopNonce: number;
};

function PlayingVisual() {
  return (
    <div className="rounded-3xl border-4 border-fuchsia-400 bg-gradient-to-b from-fuchsia-800/90 to-violet-900/90 px-8 py-14 text-center shadow-2xl">
      <div className="mx-auto mb-6 flex items-end justify-center gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="inline-block w-2 animate-pulse rounded-full bg-fuchsia-300"
            style={{
              height: `${20 + (i % 3) * 16}px`,
              animationDelay: `${i * 0.12}s`,
            }}
          />
        ))}
      </div>
      <p className="text-3xl font-black text-white">Extrait en cours</p>
      <p className="mt-2 text-violet-200">Écoutez bien…</p>
    </div>
  );
}

/** Blind test MP3 sur l'écran TV (activation audio une fois par session). */
export function MusicalBlindTest({
  audioUrl,
  playNonce,
  stopNonce,
}: MusicalBlindTestProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pendingPlay, setPendingPlay] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(UNLOCK_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  const stopPlayback = useCallback(() => {
    setPlaying(false);
    setPendingPlay(false);
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, []);

  const startPlayback = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.src = audioUrl;
    el.currentTime = 0;
    void el.play().catch(() => {
      setPendingPlay(true);
      setPlaying(false);
    });
    setPlaying(true);
    setPendingPlay(false);
  }, [audioUrl]);

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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        if (!unlocked || pendingPlay) unlockAndMaybePlay();
        else if (pendingPlay && unlocked) startPlayback();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlocked, pendingPlay, unlockAndMaybePlay, startPlayback]);

  if (!unlocked) {
    return (
      <button
        type="button"
        onClick={unlockAndMaybePlay}
        className="relative z-10 mx-auto mb-8 block w-full max-w-2xl rounded-3xl border-4 border-amber-400 bg-gradient-to-b from-amber-600/90 to-orange-700/90 px-8 py-14 text-center shadow-2xl"
      >
        <p className="text-5xl">🔊</p>
        <p className="mt-4 text-2xl font-black text-white">
          Touchez l&apos;écran pour activer le son
        </p>
        <p className="mt-3 text-violet-100">Une fois par session TV</p>
        {pendingPlay && (
          <p className="mt-4 animate-pulse text-lg font-bold text-lime-200">
            Extrait en attente — recliquez ou Espace
          </p>
        )}
      </button>
    );
  }

  if (!playing && !pendingPlay) {
    return (
      <div className="relative z-10 mx-auto mb-8 w-full max-w-2xl rounded-3xl border-4 border-fuchsia-400/70 bg-gradient-to-b from-fuchsia-950/80 to-violet-950/80 px-8 py-14 text-center shadow-xl">
        <p className="text-6xl">🎵</p>
        <p className="mt-4 text-2xl font-bold text-fuchsia-200">Blind test musical</p>
        <p className="mt-2 text-violet-300">En attente — le présentateur lance l&apos;extrait</p>
      </div>
    );
  }

  if (pendingPlay && unlocked) {
    return (
      <button
        type="button"
        onClick={startPlayback}
        className="relative z-10 mx-auto mb-8 block w-full max-w-2xl rounded-3xl border-4 border-lime-400 bg-gradient-to-b from-lime-700/90 to-green-800/90 px-8 py-12 text-center shadow-2xl"
      >
        <p className="text-4xl">▶</p>
        <p className="mt-3 text-2xl font-black text-white">Extrait prêt</p>
        <p className="mt-2 text-lime-100">Cliquez ou Espace pour écouter</p>
      </button>
    );
  }

  return (
    <div className="relative z-10 mx-auto mb-8 w-full max-w-2xl">
      <PlayingVisual />
      <audio ref={audioRef} preload="auto" className="hidden" />
    </div>
  );
}
