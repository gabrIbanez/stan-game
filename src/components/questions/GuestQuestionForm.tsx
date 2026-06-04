"use client";

import { useState } from "react";
import type { AnswerMode, QuestionKind } from "@/types/game";
import { ANSWER_MODE_OPTIONS } from "@/lib/constants";
import { QuestionKindPicker } from "@/components/questions/QuestionKindPicker";
import {
  uploadImage,
  uploadMp3,
  uploadVideo,
} from "@/lib/media-upload-client";

type GuestQuestionFormProps = {
  sessionId: string;
  playerId: string;
  playerName: string;
  championName?: string | null;
  onSaved: () => void;
};

export function GuestQuestionForm({
  sessionId,
  playerId,
  playerName,
  championName,
  onSaved,
}: GuestQuestionFormProps) {
  const stan = championName?.trim() || "Stan";
  const defaultTheme = `${stan} & ${playerName}`;

  const [kind, setKind] = useState<QuestionKind>("TEXT");
  const [text, setText] = useState("");
  const [category, setCategory] = useState("PERSO");
  const [answerMode, setAnswerMode] = useState<AnswerMode>("CARRE");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [theme, setTheme] = useState(defaultTheme);
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optionCount = answerMode === "DUO" ? 2 : answerMode === "CARRE" ? 4 : 0;
  const isMusical = kind === "MUSICAL";
  const isVideo = kind === "VIDEO";
  const isImage = kind === "IMAGE";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let audioUrl: string | undefined;
      let videoUrl: string | undefined;
      let imageUrl: string | undefined;

      if (isMusical) {
        if (!mp3File) {
          setError("Choisis un extrait MP3.");
          setLoading(false);
          return;
        }
        audioUrl = await uploadMp3(mp3File);
      }
      if (isVideo) {
        if (!videoFile) {
          setError("Choisis une vidéo (MP4 ou WebM).");
          setLoading(false);
          return;
        }
        videoUrl = await uploadVideo(videoFile);
      }
      if (isImage) {
        if (!imageFile) {
          setError("Choisis une photo.");
          setLoading(false);
          return;
        }
        imageUrl = await uploadImage(imageFile);
      }

      const res = await fetch(`/api/sessions/${sessionId}/contrib/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
          kind,
          text,
          category,
          round: "COMPET",
          answerMode,
          correctAnswer,
          options: options.slice(0, optionCount),
          theme: theme || defaultTheme,
          audioUrl,
          videoUrl,
          imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Enregistrement impossible.");

      setText("");
      setCorrectAnswer("");
      setOptions(["", "", "", ""]);
      setMp3File(null);
      setVideoFile(null);
      setImageFile(null);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <QuestionKindPicker
        value={kind}
        onChange={setKind}
        championName={championName}
      />

      {isMusical && (
        <div className="space-y-2 rounded-xl border border-fuchsia-500/40 bg-fuchsia-950/30 p-4">
          <label className="text-sm font-semibold text-fuchsia-200">Extrait MP3</label>
          <input
            type="file"
            accept="audio/mpeg,audio/mp3,.mp3"
            onChange={(e) => setMp3File(e.target.files?.[0] ?? null)}
            className="w-full text-sm file:rounded-lg file:bg-fuchsia-600 file:px-4 file:py-2 file:font-bold file:text-white"
          />
        </div>
      )}
      {isVideo && (
        <div className="space-y-2 rounded-xl border border-indigo-500/40 bg-indigo-950/30 p-4">
          <label className="text-sm font-semibold text-indigo-200">Vidéo</label>
          <input
            type="file"
            accept="video/mp4,video/webm,.mp4,.webm"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm file:rounded-lg file:bg-indigo-600 file:px-4 file:py-2 file:font-bold file:text-white"
          />
        </div>
      )}
      {isImage && (
        <div className="space-y-2 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4">
          <label className="text-sm font-semibold text-emerald-200">Photo</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm file:rounded-lg file:bg-emerald-600 file:px-4 file:py-2 file:font-bold file:text-white"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-violet-300">
          {isMusical || isVideo || isImage ? "Consigne (lue à voix haute)" : "Ta question"}
        </label>
        <textarea
          required
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Ex. : Quel moment avec ${stan} tu n'oublieras jamais ?`}
          className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-violet-300">Catégorie affichée</label>
          <input
            required
            value={category}
            onChange={(e) => setCategory(e.target.value.toUpperCase())}
            className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-violet-300">Mode de réponse suggéré</label>
          <select
            value={answerMode}
            onChange={(e) => setAnswerMode(e.target.value as AnswerMode)}
            className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
          >
            {ANSWER_MODE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-violet-500">
            Le participant pourra quand même choisir Cash / Duo / Carré sur le plateau.
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm text-violet-300">Thème (manche Compet&apos;)</label>
        <input
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-violet-300">Bonne réponse (secrète)</label>
        <input
          required
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
        />
      </div>

      {optionCount > 0 && (
        <div className="space-y-2">
          <label className="block text-sm text-violet-300">
            Fausses réponses / propositions ({optionCount})
          </label>
          {Array.from({ length: optionCount }).map((_, i) => (
            <input
              key={i}
              value={options[i] ?? ""}
              onChange={(e) => {
                const next = [...options];
                next[i] = e.target.value;
                setOptions(next);
              }}
              placeholder={`Proposition ${i + 1}`}
              className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
            />
          ))}
        </div>
      )}

      {error && <p className="text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-black text-black disabled:opacity-50"
      >
        {loading ? "Envoi…" : "Envoyer ma question"}
      </button>
    </form>
  );
}
