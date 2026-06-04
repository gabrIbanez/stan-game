"use client";

import { useState } from "react";
import type { AnswerMode, GameRound, Question } from "@/types/game";
import { ANSWER_MODE_LABELS, ROUND_LABELS } from "@/lib/game-rules";
import { ResponseHistory } from "@/components/game/ResponseHistory";
import {
  isImageQuestion,
  isMusicalQuestion,
  isVideoQuestion,
} from "@/lib/question-utils";
import { JoinQrDisplay } from "@/components/game/JoinQrDisplay";
import { buildJoinUrl } from "@/lib/session-join";

type Player = {
  id: string;
  name: string;
  score: number;
  qualified: boolean;
  eliminated: boolean;
  isChampion: boolean;
  joinedViaQr?: boolean;
};

type QuestionWithContributor = Question & {
  contributor?: { name: string } | null;
};

type HostPanelProps = {
  sessionId: string;
  currentRound: GameRound;
  players: Player[];
  questions: QuestionWithContributor[];
  registrationsOpen: boolean;
  showJoinQrOnScreen: boolean;
  sessionStatus: string;
  currentQuestionId: string | null;
  displayMode: AnswerMode | null;
  revealAnswer: boolean;
  qualifQuestionSlot: number | null;
  competWave: string | null;
  finaleHidden: boolean;
  musicPlayNonce: number;
  musicStopNonce: number;
  videoPlayNonce: number;
  videoStopNonce: number;
  imagePlayNonce: number;
  imageStopNonce: number;
  onSessionUpdate: () => void;
};

export function HostPanel({
  sessionId,
  currentRound,
  players,
  questions,
  currentQuestionId,
  displayMode,
  revealAnswer,
  qualifQuestionSlot,
  competWave,
  finaleHidden,
  musicPlayNonce,
  musicStopNonce,
  videoPlayNonce,
  videoStopNonce,
  imagePlayNonce,
  imageStopNonce,
  registrationsOpen,
  showJoinQrOnScreen,
  sessionStatus,
  onSessionUpdate,
}: HostPanelProps) {
  const [historyKey, setHistoryKey] = useState(0);
  const activePlayers = players.filter((p) => !p.eliminated);

  async function patchSession(data: Record<string, unknown>) {
    await fetch(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    onSessionUpdate();
  }

  async function loadQuestion(questionId: string) {
    await patchSession({
      currentQuestionId: questionId,
      displayMode: null,
      revealAnswer: false,
      musicPlayNonce: 0,
      musicStopNonce: 0,
      videoPlayNonce: 0,
      videoStopNonce: 0,
      imagePlayNonce: 0,
      imageStopNonce: 0,
    });
  }

  async function playMusicExtract() {
    await patchSession({ musicPlayNonce: musicPlayNonce + 1 });
  }

  async function stopMusicExtract() {
    await patchSession({ musicStopNonce: musicStopNonce + 1 });
  }

  async function playVideo() {
    await patchSession({ videoPlayNonce: videoPlayNonce + 1 });
  }

  async function stopVideo() {
    await patchSession({ videoStopNonce: videoStopNonce + 1 });
  }

  async function showImage() {
    await patchSession({ imagePlayNonce: imagePlayNonce + 1 });
  }

  async function hideImage() {
    await patchSession({ imageStopNonce: imageStopNonce + 1 });
  }

  async function setParticipantMode(mode: AnswerMode) {
    await patchSession({ displayMode: mode, revealAnswer: false });
  }

  async function recordResponse(playerId: string, correct: boolean) {
    if (!displayMode) return;
    await fetch(`/api/sessions/${sessionId}/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId,
        questionId: currentQuestionId,
        answerMode: displayMode,
        correct,
        competIndividual: competWave === "INDIVIDUAL",
      }),
    });
    setHistoryKey((k) => k + 1);
    onSessionUpdate();
  }

  async function qualifyTop() {
    await fetch(`/api/sessions/${sessionId}/qualify`, { method: "POST" });
    await patchSession({ currentRound: "COMPET", competWave: "DUO" });
  }

  async function revealFinale() {
    await fetch(`/api/sessions/${sessionId}/reveal-finale`, { method: "POST" });
    onSessionUpdate();
  }

  const filteredQuestions = questions.filter((q) => {
    if (currentRound === "QUALIFS") {
      return (
        q.round === "QUALIFS" &&
        (qualifQuestionSlot ? q.qualifSlot === qualifQuestionSlot : true)
      );
    }
    if (currentRound === "COMPET") return q.round === "COMPET";
    return q.round === "FINALE";
  });

  const currentQuestion = questions.find((q) => q.id === currentQuestionId);
  const waveMode =
    competWave === "DUO" || competWave === "CARRE" || competWave === "CASH"
      ? (competWave as AnswerMode)
      : null;

  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-auto border-l border-violet-800 bg-slate-950 p-4 text-sm text-violet-100">
      <div>
        <h2 className="text-lg font-bold text-amber-400">Pupitre présentateur</h2>
        <p className="text-violet-300">{ROUND_LABELS[currentRound]}</p>
        {competWave && (
          <p className="text-xs text-violet-400">Vague : {competWave}</p>
        )}
      </div>

      <section className="space-y-2">
        <h3 className="font-semibold text-white">Manche</h3>
        <div className="flex flex-wrap gap-1">
          {(["QUALIFS", "COMPET", "FINALE"] as GameRound[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => patchSession({ currentRound: r })}
              className={`rounded-lg px-2 py-1 text-xs ${
                currentRound === r
                  ? "bg-amber-500 text-black"
                  : "bg-violet-800 hover:bg-violet-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </section>

      {currentRound === "QUALIFS" && (
        <section className="space-y-2">
          <h3 className="font-semibold text-white">Question qualif (1 ou 2)</h3>
          <div className="flex gap-1">
            {[1, 2].map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() =>
                  patchSession({
                    qualifQuestionSlot: slot,
                    currentQuestionId: null,
                    displayMode: null,
                  })
                }
                className={`rounded-lg px-3 py-1 ${
                  qualifQuestionSlot === slot
                    ? "bg-amber-500 text-black"
                    : "bg-violet-800"
                }`}
              >
                Q{slot}
              </button>
            ))}
          </div>
        </section>
      )}

      {currentRound === "COMPET" && (
        <section className="space-y-2">
          <h3 className="font-semibold text-white">Vague Compet&apos;</h3>
          <div className="flex flex-wrap gap-1">
            {["DUO", "CARRE", "CASH", "INDIVIDUAL"].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => patchSession({ competWave: w })}
                className={`rounded-lg px-2 py-1 text-xs ${
                  competWave === w ? "bg-amber-500 text-black" : "bg-violet-800"
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3 rounded-lg border border-cyan-500/40 bg-cyan-950/20 p-3">
        <h3 className="font-semibold text-cyan-200">Inscriptions (QR)</h3>
        <JoinQrDisplay
          sessionId={sessionId}
          playerCount={players.length}
          registrationsOpen={registrationsOpen}
          size="compact"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              patchSession({ registrationsOpen: !registrationsOpen })
            }
            className={`flex-1 rounded-lg py-2 text-xs font-bold ${
              registrationsOpen
                ? "bg-lime-700 text-white"
                : "bg-red-900 text-red-100"
            }`}
          >
            {registrationsOpen ? "Clore les inscriptions" : "Rouvrir inscriptions"}
          </button>
          <button
            type="button"
            onClick={() =>
              patchSession({ showJoinQrOnScreen: !showJoinQrOnScreen })
            }
            className={`flex-1 rounded-lg py-2 text-xs font-bold ${
              showJoinQrOnScreen
                ? "bg-cyan-600 text-white"
                : "bg-violet-800 text-violet-200"
            }`}
          >
            {showJoinQrOnScreen ? "Masquer QR sur TV" : "Afficher QR sur TV"}
          </button>
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(buildJoinUrl(sessionId));
            } catch {
              /* ignore */
            }
          }}
          className="w-full rounded-lg border border-violet-600 py-1.5 text-xs text-violet-300 hover:bg-violet-900"
        >
          Copier le lien d&apos;inscription
        </button>
        {sessionStatus === "SETUP" && players.length > 0 && (
          <button
            type="button"
            onClick={() => patchSession({ status: "IN_PROGRESS" })}
            className="w-full rounded-lg bg-amber-500 py-2 font-bold text-black"
          >
            Lancer la partie ({players.length} inscrits)
          </button>
        )}
        <p className="text-[10px] text-violet-500">
          {players.filter((p) => p.joinedViaQr).length} inscrit(s) via QR
        </p>
      </section>

      <section className="space-y-2">
        <h3 className="font-semibold text-white">1. Charger une question</h3>
        <select
          className="w-full rounded-lg border border-violet-700 bg-violet-950 px-2 py-2"
          value={currentQuestionId ?? ""}
          onChange={(e) => e.target.value && loadQuestion(e.target.value)}
        >
          <option value="">— Choisir —</option>
          {filteredQuestions.map((q) => (
            <option key={q.id} value={q.id}>
              {q.kind === "MUSICAL" ? "🎵 " : ""}
              {q.kind === "VIDEO" ? "🎬 " : ""}
              {q.kind === "IMAGE" ? "🖼 " : ""}
              {q.contributor?.name ? `✨ ${q.contributor.name} · ` : ""}
              {q.category} — {q.text.slice(0, 50)}…
            </option>
          ))}
        </select>
        <p className="text-xs text-violet-400">
          La question s&apos;affiche sans les réponses. Le participant annonce son
          mode.
        </p>
      </section>

      {currentQuestion && isMusicalQuestion(currentQuestion) && (
        <section className="space-y-2 rounded-lg border border-fuchsia-500/50 bg-fuchsia-950/40 p-3">
          <h3 className="font-semibold text-fuchsia-200">Extrait musical</h3>
          <p className="text-xs text-violet-300">
            La question s&apos;affiche tout de suite sur l&apos;écran TV (sans son).
            L&apos;extrait se précharge — lancez-le quand vous voulez. Seul le pupitre
            démarre la lecture.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={playMusicExtract}
              className="flex-1 rounded-lg bg-fuchsia-600 py-2 font-bold text-white hover:bg-fuchsia-500"
            >
              ▶ Lancer l&apos;extrait
            </button>
            <button
              type="button"
              onClick={stopMusicExtract}
              className="rounded-lg bg-violet-800 px-4 py-2 font-bold hover:bg-violet-700"
            >
              ⏸ Arrêter
            </button>
          </div>
        </section>
      )}

      {currentQuestion && isImageQuestion(currentQuestion) && (
        <section className="space-y-2 rounded-lg border border-emerald-500/50 bg-emerald-950/40 p-3">
          <h3 className="font-semibold text-emerald-200">Image</h3>
          <p className="text-xs text-violet-300">
            La question s&apos;affiche tout de suite sur l&apos;écran TV (sans image).
            L&apos;image se précharge — affichez-la quand vous voulez.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={showImage}
              className="flex-1 rounded-lg bg-emerald-600 py-2 font-bold text-white hover:bg-emerald-500"
            >
              ▶ Afficher l&apos;image
            </button>
            <button
              type="button"
              onClick={hideImage}
              className="rounded-lg bg-violet-800 px-4 py-2 font-bold hover:bg-violet-700"
            >
              ⏸ Masquer
            </button>
          </div>
        </section>
      )}

      {currentQuestion && isVideoQuestion(currentQuestion) && (
        <section className="space-y-2 rounded-lg border border-indigo-500/50 bg-indigo-950/40 p-3">
          <h3 className="font-semibold text-indigo-200">Vidéo</h3>
          <p className="text-xs text-violet-300">
            La question s&apos;affiche tout de suite sur l&apos;écran TV (sans
            image). La vidéo se précharge en arrière-plan — lancez-la quand vous
            voulez (ex. après avoir posé la question). Seul le pupitre démarre
            la lecture ; un clic sur la vidéo ne fait rien.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={playVideo}
              className="flex-1 rounded-lg bg-indigo-600 py-2 font-bold text-white hover:bg-indigo-500"
            >
              ▶ Afficher la vidéo
            </button>
            <button
              type="button"
              onClick={stopVideo}
              className="rounded-lg bg-violet-800 px-4 py-2 font-bold hover:bg-violet-700"
            >
              ⏸ Masquer
            </button>
          </div>
        </section>
      )}

      {currentQuestion && (
        <section className="space-y-3 rounded-lg border-2 border-amber-500/40 bg-violet-900/50 p-3">
          <h3 className="font-semibold text-amber-300">
            2. Mode choisi par le participant
          </h3>
          {waveMode && !displayMode && (
            <p className="text-xs text-amber-200/80">
              Vague {waveMode} : le mode est imposé par la manche.
            </p>
          )}
          <div className="grid grid-cols-1 gap-2">
            {(["CASH", "DUO", "CARRE"] as AnswerMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setParticipantMode(mode)}
                className={`rounded-xl py-3 font-bold transition ${
                  displayMode === mode
                    ? "bg-amber-500 text-black ring-2 ring-amber-200"
                    : "bg-violet-800 text-white hover:bg-violet-700"
                }`}
              >
                {ANSWER_MODE_LABELS[mode]}
              </button>
            ))}
          </div>
          {waveMode && (
            <button
              type="button"
              onClick={() => setParticipantMode(waveMode)}
              className="w-full rounded-lg border border-amber-500/50 py-2 text-xs text-amber-300 hover:bg-amber-500/10"
            >
              Appliquer le mode de la vague ({waveMode})
            </button>
          )}
          {displayMode && (
            <button
              type="button"
              onClick={() => patchSession({ displayMode: null, revealAnswer: false })}
              className="w-full text-xs text-violet-400 hover:text-violet-200"
            >
              Changer de mode (masquer les propositions)
            </button>
          )}
        </section>
      )}

      {currentQuestion && displayMode && (
        <section className="space-y-2 rounded-lg bg-violet-900/50 p-3">
          <h3 className="font-semibold text-white">3. Révéler la réponse</h3>
          <button
            type="button"
            onClick={() => patchSession({ revealAnswer: !revealAnswer })}
            className="w-full rounded-lg bg-lime-600 py-2 font-bold text-white hover:bg-lime-500"
          >
            {revealAnswer ? "Masquer la réponse" : "Révéler la bonne réponse"}
          </button>
          <p className="text-xs text-violet-300">
            Réponse : <strong className="text-white">{currentQuestion.correctAnswer}</strong>
          </p>
        </section>
      )}

      <section className="space-y-2">
        <h3 className="font-semibold text-white">4. Noter le participant</h3>
        {!displayMode && currentQuestionId && (
          <p className="text-xs text-amber-400">
            Validez d&apos;abord le mode (étape 2) avant de noter.
          </p>
        )}
        {activePlayers.map((player) => (
          <div
            key={player.id}
            className="rounded-lg border border-violet-800 bg-violet-950/80 p-2"
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium">
                {player.name}
                {player.isChampion && " ★"}
                {player.qualified && " ✓"}
              </span>
              <span className="font-mono text-amber-400">
                {currentRound === "FINALE" && finaleHidden ? "?" : player.score} pts
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!displayMode}
                onClick={() => recordResponse(player.id, true)}
                className="flex-1 rounded-lg bg-lime-700 py-1.5 text-sm font-bold hover:bg-lime-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Bonne réponse
              </button>
              <button
                type="button"
                disabled={!displayMode}
                onClick={() => recordResponse(player.id, false)}
                className="flex-1 rounded-lg bg-red-800 py-1.5 text-sm font-bold hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Mauvaise réponse
              </button>
            </div>
            {displayMode && (
              <p className="mt-1 text-center text-[10px] text-violet-500">
                Mode actif : {ANSWER_MODE_LABELS[displayMode]}
              </p>
            )}
          </div>
        ))}
      </section>

      <ResponseHistory
        sessionId={sessionId}
        refreshKey={historyKey}
        onUpdated={() => {
          setHistoryKey((k) => k + 1);
          onSessionUpdate();
        }}
      />

      <section className="mt-auto space-y-2 border-t border-violet-800 pt-4">
        {currentRound === "QUALIFS" && (
          <button
            type="button"
            onClick={qualifyTop}
            className="w-full rounded-lg bg-fuchsia-600 py-2 font-bold hover:bg-fuchsia-500"
          >
            Qualifier le top 4 → Compet&apos;
          </button>
        )}
        {currentRound === "FINALE" && finaleHidden && (
          <button
            type="button"
            onClick={revealFinale}
            className="w-full rounded-lg bg-amber-500 py-2 font-bold text-black hover:bg-amber-400"
          >
            Décompte final des points
          </button>
        )}
        <a
          href={`/sessions/${sessionId}/ecran`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-lg border border-amber-500 py-2 text-center font-bold text-amber-400 hover:bg-amber-500/10"
        >
          Ouvrir l&apos;écran TV ↗
        </a>
      </section>
    </aside>
  );
}
