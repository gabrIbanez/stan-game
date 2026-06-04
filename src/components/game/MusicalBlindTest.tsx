"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TV_MEDIA_UNLOCK_KEY } from "@/lib/constants";

type MusicalBlindTestProps = {
  audioUrl: string;
  playNonce: number;
  stopNonce: number;
};

function PlayingVisual() {
  return (
    <div className="pointer-events-none rounded-3xl border-4 border-fuchsia-400 bg-gradient-to-b from-fuchsia-800/90 to-violet-900/90 px-8 py-14 text-center shadow-2xl">
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

function waitForCanPlay(el: HTMLAudioElement) {
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
 * Précharge le MP3 en arrière-plan. Rien à l'écran tant que le présentateur ne lance pas.
 */
export function MusicalBlindTest({
  audioUrl,
  playNonce,
  stopNonce,
}: MusicalBlindTestProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [visible, setVisible] = useState(false);
  const [needsStaffTap, setNeedsStaffTap] = useState(false);
  const [soundUnlocked, setSoundUnlocked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem(TV_MEDIA_UNLOCK_KEY) === "1") {
      setSoundUnlocked(true);
    }
  }, []);

  const resetPreload = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    setVisible(false);
    setNeedsStaffTap(false);
    el.pause();
    el.currentTime = 0;
    el.src = audioUrl;
    el.load();
  }, [audioUrl]);

  useEffect(() => {
    resetPreload();
  }, [resetPreload]);

  const hide = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setVisible(false);
    setNeedsStaffTap(false);
  }, []);

  useEffect(() => {
    if (stopNonce <= 0) return;
    hide();
  }, [stopNonce, hide]);

  const startFromHost = useCallback(async () => {
    const el = audioRef.current;
    if (!el) return;

    setVisible(true);
    el.currentTime = 0;
    await waitForCanPlay(el);

    if (soundUnlocked) {
      try {
        await el.play();
        setNeedsStaffTap(false);
        return;
      } catch {
        /* repli ci-dessous */
      }
    }

    try {
      await el.play();
      setNeedsStaffTap(false);
    } catch {
      setNeedsStaffTap(true);
    }
  }, [soundUnlocked]);

  useEffect(() => {
    if (playNonce <= 0) return;
    void startFromHost();
  }, [playNonce, startFromHost]);

  async function enableSound() {
    const el = audioRef.current;
    if (!el || !visible) return;
    setSoundUnlocked(true);
    sessionStorage.setItem(TV_MEDIA_UNLOCK_KEY, "1");
    try {
      await el.play();
      setNeedsStaffTap(false);
    } catch {
      setNeedsStaffTap(true);
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
        onEnded={() => hide()}
      />

      {visible && (
        <div className="relative z-10 mx-auto mb-8 w-full max-w-2xl">
          <PlayingVisual />
        </div>
      )}

      {needsStaffTap && visible && (
        <button
          type="button"
          onClick={enableSound}
          className="relative z-20 mx-auto mb-8 block w-full max-w-2xl rounded-2xl border-4 border-amber-400 bg-amber-700/90 px-6 py-4 text-center font-bold text-white shadow-xl"
        >
          Activer le son (staff — écran TV)
          <span className="mt-1 block text-sm font-normal text-amber-100">
            L&apos;extrait est déjà lancé par le présentateur
          </span>
        </button>
      )}
    </>
  );
}
