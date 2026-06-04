"use client";

import { useState } from "react";
import type { AnswerMode, Question, QuestionKind, QuestionRound } from "@/types/game";
import {
  ANSWER_MODE_OPTIONS,
  QUESTION_KIND_OPTIONS,
  QUESTION_ROUND_OPTIONS,
} from "@/lib/constants";
import {
  uploadImage,
  uploadMp3,
  uploadVideo,
} from "@/lib/media-upload-client";

type QuestionFormProps = {
  initial?: Question;
  onSaved: () => void;
  onCancel?: () => void;
};

export function QuestionForm({ initial, onSaved, onCancel }: QuestionFormProps) {
  const [kind, setKind] = useState<QuestionKind>(initial?.kind ?? "TEXT");
  const [text, setText] = useState(initial?.text ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [round, setRound] = useState<QuestionRound>(initial?.round ?? "QUALIFS");
  const [answerMode, setAnswerMode] = useState<AnswerMode>(
    initial?.answerMode ?? "CARRE",
  );
  const [correctAnswer, setCorrectAnswer] = useState(initial?.correctAnswer ?? "");
  const [options, setOptions] = useState<string[]>(
    initial?.options?.length ? initial.options : ["", "", "", ""],
  );
  const [theme, setTheme] = useState(initial?.theme ?? "");
  const [qualifSlot, setQualifSlot] = useState<string>(
    initial?.qualifSlot?.toString() ?? "",
  );
  const [audioUrl, setAudioUrl] = useState(initial?.audioUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
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
      let finalAudioUrl = audioUrl;
      let finalVideoUrl = videoUrl;
      let finalImageUrl = imageUrl;

      if (isMusical) {
        if (mp3File) {
          finalAudioUrl = await uploadMp3(mp3File);
        } else if (!finalAudioUrl) {
          setError("Choisissez un fichier MP3.");
          setLoading(false);
          return;
        }
      }

      if (isVideo) {
        if (videoFile) {
          finalVideoUrl = await uploadVideo(videoFile);
        } else if (!finalVideoUrl) {
          setError("Choisissez une vidéo (MP4/WebM).");
          setLoading(false);
          return;
        }
      }

      if (isImage) {
        if (imageFile) {
          finalImageUrl = await uploadImage(imageFile);
        } else if (!finalImageUrl) {
          setError("Choisissez une image (JPEG, PNG ou WebP).");
          setLoading(false);
          return;
        }
      }

      const payload = {
        kind,
        text,
        category,
        round,
        answerMode,
        correctAnswer,
        options: options.slice(0, optionCount),
        theme: theme || undefined,
        qualifSlot: qualifSlot ? Number(qualifSlot) : undefined,
        audioUrl: isMusical ? finalAudioUrl : undefined,
        videoUrl: isVideo ? finalVideoUrl : undefined,
        imageUrl: isImage ? finalImageUrl : undefined,
      };

      const url = initial ? `/api/questions/${initial.id}` : "/api/questions";
      const res = await fetch(url, {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur lors de l'enregistrement.");
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-violet-800 bg-violet-950/50 p-6"
    >
      <div>
        <label className="mb-1 block text-sm text-violet-300">Type de question</label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as QuestionKind)}
          className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
        >
          {QUESTION_KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {isMusical && (
        <div className="space-y-3 rounded-xl border border-fuchsia-500/40 bg-fuchsia-950/30 p-4">
          <p className="text-sm font-semibold text-fuchsia-200">Fichier MP3</p>
          <p className="text-xs text-violet-400">
            Montez votre extrait pour qu&apos;il commence au bon moment (pas de timecode
            dans l&apos;app).
          </p>
          <input
            type="file"
            accept="audio/mpeg,audio/mp3,.mp3"
            onChange={(e) => setMp3File(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-violet-200 file:mr-3 file:rounded-lg file:border-0 file:bg-fuchsia-600 file:px-4 file:py-2 file:font-bold file:text-white"
          />
          {audioUrl && !mp3File && (
            <p className="text-xs text-lime-400">
              Fichier actuel : {audioUrl.split("/").pop()}
              {" — laissez vide pour le conserver, ou choisissez un nouveau fichier."}
            </p>
          )}
        </div>
      )}

      {isVideo && (
        <div className="space-y-3 rounded-xl border border-indigo-500/40 bg-indigo-950/30 p-4">
          <p className="text-sm font-semibold text-indigo-200">Fichier vidéo</p>
          <p className="text-xs text-violet-400">
            Donnez une vidéo unique (pas de timecode). L&apos;écran TV affichera la vidéo
            quand vous lancerez depuis le pupitre.
          </p>
          <input
            type="file"
            accept="video/mp4,video/webm,.mp4,.webm"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-violet-200 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:font-bold file:text-white"
          />
          {videoUrl && !videoFile && (
            <p className="text-xs text-lime-400">
              Vidéo actuelle : {videoUrl.split("/").pop()}
              {" — laissez vide pour la conserver, ou choisissez une nouvelle vidéo."}
            </p>
          )}
        </div>
      )}

      {isImage && (
        <div className="space-y-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4">
          <p className="text-sm font-semibold text-emerald-200">Fichier image</p>
          <p className="text-xs text-violet-400">
            L&apos;écran TV affichera l&apos;image quand vous l&apos;afficherez depuis le
            pupitre (préchargement en arrière-plan).
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-violet-200 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:font-bold file:text-white"
          />
          {imageUrl && !imageFile && (
            <p className="text-xs text-lime-400">
              Image actuelle : {imageUrl.split("/").pop()}
              {" — laissez vide pour la conserver, ou choisissez une nouvelle image."}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-violet-300">
          {isMusical || isVideo || isImage ? "Consigne affichée" : "Question"}
        </label>
        <textarea
          required
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            isMusical
              ? "Quel est ce titre ? Quel est cet artiste ?"
              : isVideo
                ? "Que se passe-t-il dans cette vidéo ?"
                : isImage
                  ? "Que représente cette image ?"
                  : undefined
          }
          className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-violet-300">Catégorie (affichée)</label>
          <input
            required
            value={category}
            onChange={(e) => setCategory(e.target.value.toUpperCase())}
            placeholder={
              isMusical
                ? "BLIND TEST"
                : isVideo
                  ? "VIDÉO"
                  : isImage
                    ? "IMAGE"
                    : "NOBEL DE LA PAIX"
            }
            className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-violet-300">Manche</label>
          <select
            value={round}
            onChange={(e) => setRound(e.target.value as QuestionRound)}
            className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
          >
            {QUESTION_ROUND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-violet-300">Mode par défaut</label>
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
        </div>
        {round === "QUALIFS" && (
          <div>
            <label className="mb-1 block text-sm text-violet-300">
              Question qualif n° (1 ou 2)
            </label>
            <select
              value={qualifSlot}
              onChange={(e) => setQualifSlot(e.target.value)}
              className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
            >
              <option value="">—</option>
              <option value="1">Question 1</option>
              <option value="2">Question 2</option>
            </select>
          </div>
        )}
        {round === "COMPET" && (
          <div>
            <label className="mb-1 block text-sm text-violet-300">Thème Compet&apos;</label>
            <input
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Capitales, Cinéma…"
              className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
            />
          </div>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm text-violet-300">Bonne réponse</label>
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
            Propositions ({optionCount})
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
              placeholder={`Réponse ${i + 1}`}
              className="w-full rounded-lg border border-violet-700 bg-violet-950 px-3 py-2"
            />
          ))}
        </div>
      )}
      {error && <p className="text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-500 px-6 py-2 font-bold text-black hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "Enregistrement…" : initial ? "Mettre à jour" : "Ajouter"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-violet-600 px-4 py-2 hover:bg-violet-900"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
