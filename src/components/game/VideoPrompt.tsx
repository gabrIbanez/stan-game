"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TV_MEDIA_UNLOCK_KEY } from "@/lib/constants";

type VideoPromptProps = {
  videoUrl: string;
  playNonce: number;
  stopNonce: number;
};

function waitForCanPlay(el: HTMLVideoElement) {
  if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      el.removeEventListener("canplay", done);
      resolve();
    };
    el.addEventListener("canplay", done);
  });
}

/**
 * Précharge en arrière-plan. Lecture uniquement via playNonce (pupitre).
 * La balise vidéo ignore les clics — pas de play/pause par le public.
 */
export function VideoPrompt({
  videoUrl,
  playNonce,
  stopNonce,
}: VideoPromptProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [playingMuted, setPlayingMuted] = useState(false);
  const [soundUnlocked, setSoundUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(TV_MEDIA_UNLOCK_KEY) === "1") {
      setSoundUnlocked(true);
    }
  }, []);

  const resetPreload = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    setVisible(false);
    setPlayingMuted(false);
    el.pause();
    el.muted = true;
    el.src = videoUrl;
    el.load();
  }, [videoUrl]);

  useEffect(() => {
    resetPreload();
  }, [resetPreload]);

  const hide = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    el.muted = true;
    setVisible(false);
    setPlayingMuted(false);
  }, []);

  useEffect(() => {
    if (stopNonce <= 0) return;
    hide();
  }, [stopNonce, hide]);

  const startFromHost = useCallback(async () => {
    const el = videoRef.current;
    if (!el) return;

    setVisible(true);
    el.currentTime = 0;
    await waitForCanPlay(el);

    if (soundUnlocked) {
      el.muted = false;
      try {
        await el.play();
        setPlayingMuted(false);
        return;
      } catch {
        /* repli muet ci-dessous */
      }
    }

    el.muted = true;
    try {
      await el.play();
      setPlayingMuted(true);
    } catch {
      setPlayingMuted(false);
      setVisible(false);
    }
  }, [soundUnlocked]);

  useEffect(() => {
    if (playNonce <= 0) return;
    void startFromHost();
  }, [playNonce, startFromHost]);

  async function enableSound() {
    const el = videoRef.current;
    if (!el || !visible) return;
    setSoundUnlocked(true);
    sessionStorage.setItem(TV_MEDIA_UNLOCK_KEY, "1");
    el.muted = false;
    try {
      await el.play();
      setPlayingMuted(false);
    } catch {
      setPlayingMuted(true);
    }
  }

  return (
    <>
      <video
        ref={videoRef}
        preload="auto"
        playsInline
        disablePictureInPicture
        controls={false}
        tabIndex={-1}
        className={
          visible
            ? "pointer-events-none relative z-10 mx-auto mb-8 block aspect-video w-full max-w-5xl rounded-3xl border-4 border-indigo-400 bg-black shadow-2xl"
            : "pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
        }
        onEnded={() => hide()}
      />

      {playingMuted && visible && (
        <button
          type="button"
          onClick={enableSound}
          className="relative z-20 mx-auto mb-8 block w-full max-w-2xl rounded-2xl border-4 border-amber-400 bg-amber-700/90 px-6 py-4 text-center font-bold text-white shadow-xl"
        >
          Activer le son (staff — écran TV)
          <span className="mt-1 block text-sm font-normal text-amber-100">
            La vidéo est déjà lancée par le présentateur
          </span>
        </button>
      )}
    </>
  );
}
