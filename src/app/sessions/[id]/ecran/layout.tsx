import type { Metadata } from "next";
import { Suspense } from "react";
import { ParticipantScreenShell } from "@/components/game/ParticipantScreenShell";
import { getAppOrigin } from "@/lib/app-url";
import { APP_TITLE } from "@/lib/constants";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const origin = getAppOrigin();
  const pageUrl = `${origin}/sessions/${id}/ecran`;
  const imageUrl = `${pageUrl}/opengraph-image`;
  const title = `Écran TV — ${APP_TITLE}`;
  const description = "Scanne le QR code pour rejoindre la partie.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: APP_TITLE,
      locale: "fr_FR",
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: "QR code inscription" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function EcranLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0720]" />}>
      <ParticipantScreenShell sessionId={id}>{children}</ParticipantScreenShell>
    </Suspense>
  );
}
