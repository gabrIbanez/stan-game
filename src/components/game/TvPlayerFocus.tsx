type TvPlayerFocusProps = {
  playerName: string;
  subtitle?: string;
};

export function TvPlayerFocus({
  playerName,
  subtitle = "À toi de répondre",
}: TvPlayerFocusProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950 px-8 py-16 text-center">
      <p className="text-2xl font-semibold uppercase tracking-widest text-violet-300 md:text-3xl">
        {subtitle}
      </p>
      <p className="mt-6 text-6xl font-black text-amber-400 md:text-8xl lg:text-9xl">
        {playerName}
      </p>
    </div>
  );
}
