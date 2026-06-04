"use client";

type ParticipantWelcomeBannerProps = {
  name: string;
  size?: "tv" | "compact";
};

function WaitingDots({ large }: { large?: boolean }) {
  const dotClass = large
    ? "inline-block h-2 w-2 rounded-full bg-violet-300 animate-bounce"
    : "inline-block h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce";

  return (
    <span className="inline-flex items-end gap-1 pb-1" aria-hidden>
      <span className={dotClass} style={{ animationDelay: "0ms" }} />
      <span className={dotClass} style={{ animationDelay: "160ms" }} />
      <span className={dotClass} style={{ animationDelay: "320ms" }} />
    </span>
  );
}

export function ParticipantWelcomeBanner({
  name,
  size = "tv",
}: ParticipantWelcomeBannerProps) {
  const isTv = size === "tv";

  return (
    <div
      className={`w-full text-center ${isTv ? "mb-10 max-w-3xl" : "mb-4"}`}
    >
      <p
        className={`font-black text-amber-400 ${isTv ? "text-5xl md:text-6xl" : "text-2xl"}`}
      >
        Bienvenue {name}
      </p>
      <p
        className={`mt-4 flex flex-wrap items-center justify-center gap-2 text-violet-200 ${
          isTv ? "text-2xl md:text-3xl" : "text-base"
        }`}
      >
        <span>En attente des autres participants</span>
        <WaitingDots large={isTv} />
      </p>
    </div>
  );
}
