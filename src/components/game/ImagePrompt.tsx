"use client";

import { useCallback, useEffect, useState } from "react";

type ImagePromptProps = {
  imageUrl: string;
  playNonce: number;
  stopNonce: number;
};

/**
 * Précharge l'image en arrière-plan. Affichage uniquement via playNonce (pupitre).
 */
export function ImagePrompt({ imageUrl, playNonce, stopNonce }: ImagePromptProps) {
  const [visible, setVisible] = useState(false);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    hide();
  }, [imageUrl, hide]);

  useEffect(() => {
    if (stopNonce <= 0) return;
    hide();
  }, [stopNonce, hide]);

  useEffect(() => {
    if (playNonce <= 0) return;
    setVisible(true);
  }, [playNonce]);

  return (
    <>
      {/* Préchargement (toujours en DOM) */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden
        decoding="async"
        fetchPriority="high"
        className={
          visible
            ? "pointer-events-none relative z-10 mx-auto mb-8 block max-h-[min(55vh,720px)] w-full max-w-5xl rounded-3xl border-4 border-emerald-400 bg-black object-contain shadow-2xl"
            : "pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
        }
      />
    </>
  );
}
