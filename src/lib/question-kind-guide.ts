import type { QuestionKind } from "@/types/game";

export type QuestionKindGuide = {
  kind: QuestionKind;
  label: string;
  emoji: string;
  summary: string;
  stanIdeas: string[];
  hostTip: string;
};

export const QUESTION_KIND_GUIDES: QuestionKindGuide[] = [
  {
    kind: "TEXT",
    label: "Classique",
    emoji: "📝",
    summary:
      "Une consigne lue à voix haute. Le participant choisit Cash (réponse libre), Duo (2 choix) ou Carré (4 choix).",
    stanIdeas: [
      "« Où Stan a-t-il vécu sa pire gueule de bois ? »",
      "« Quel surnom Stan utilise-t-on encore aujourd'hui ? »",
      "Anecdote courte avec une réponse précise.",
    ],
    hostTip: "Idéal pour les souvenirs précis et les private jokes.",
  },
  {
    kind: "MUSICAL",
    label: "Blind test",
    emoji: "🎵",
    summary:
      "Tu envoies un MP3 (extrait déjà coupé au bon moment). L'écran TV affiche la consigne sans son ; le présentateur lance l'extrait.",
    stanIdeas: [
      "Le morceau de la soirée où Stan a chanté faux.",
      "La musique de votre road-trip.",
      "Générique ou tube qui fait penser à Stanislas.",
    ],
    hostTip: "Prépare un extrait court (10–20 s) sur ton téléphone avant d'uploader.",
  },
  {
    kind: "VIDEO",
    label: "Vidéo",
    emoji: "🎬",
    summary:
      "Une vidéo MP4/WebM. L'écran montre la consigne puis le présentateur déclenche la lecture (moment fort, chantier, soirée…).",
    stanIdeas: [
      "Clip d'une soirée, d'un mariage, d'un voyage.",
      "Stan en train de faire une bêtise.",
      "Réaction vidéo mémorable.",
    ],
    hostTip: "Pas de timecode dans l'app : monte la vidéo avant l'upload.",
  },
  {
    kind: "IMAGE",
    label: "Image",
    emoji: "🖼",
    summary:
      "Une photo JPEG/PNG/WebP. L'écran affiche la consigne puis le présentateur révèle l'image au bon moment.",
    stanIdeas: [
      "Photo de groupe avec Stan.",
      "Lieu, plat, déguisement iconique.",
      "Capture d'écran d'un message légendaire.",
    ],
    hostTip: "Pense à une question du type « Où / quand / qui sur cette photo ? ».",
  },
];

export function guideForKind(kind: QuestionKind) {
  return QUESTION_KIND_GUIDES.find((g) => g.kind === kind)!;
}
