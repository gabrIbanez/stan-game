export const APP_TITLE = "Qui veut prendre la place de Stan ?";

/** sessionStorage : activation lecture média sur l'écran TV (une fois par session). */
export const TV_MEDIA_UNLOCK_KEY = "stan-game-tv-audio-unlocked";

export const QUESTION_ROUND_OPTIONS = [
  { value: "QUALIFS", label: "Qualifs (manche 1)" },
  { value: "COMPET", label: "Compet' (manche 2)" },
  { value: "FINALE", label: "Finale (manche 3)" },
] as const;

export const ANSWER_MODE_OPTIONS = [
  { value: "CASH", label: "Cash" },
  { value: "DUO", label: "Duo (2 réponses)" },
  { value: "CARRE", label: "Carré (4 réponses)" },
] as const;

export const QUESTION_KIND_OPTIONS = [
  { value: "TEXT", label: "Classique (texte)" },
  { value: "MUSICAL", label: "Musicale (MP3)" },
  { value: "VIDEO", label: "Vidéo (upload)" },
  { value: "IMAGE", label: "Image (upload)" },
] as const;
