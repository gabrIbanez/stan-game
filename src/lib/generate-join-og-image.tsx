import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { APP_TITLE } from "@/lib/constants";
import { buildJoinUrl } from "@/lib/app-url";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";
export const ogImageAlt = "QR code pour rejoindre la partie";

export async function generateJoinOgImage(sessionId: string) {
  const joinUrl = buildJoinUrl(sessionId);
  const qrDataUrl = await QRCode.toDataURL(joinUrl, {
    width: 420,
    margin: 1,
    color: { dark: "#1e1b4b", light: "#ffffff" },
  });

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(160deg, #1e1b4b 0%, #4c1d95 50%, #0f0720 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "40px 48px",
            background: "rgba(15, 7, 32, 0.75)",
            borderRadius: 32,
            border: "3px solid #f59e0b",
          }}
        >
          <p
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: "#fbbf24",
              margin: "0 0 8px 0",
            }}
          >
            Rejoindre la partie
          </p>
          <p style={{ fontSize: 22, color: "#c4b5fd", margin: "0 0 28px 0" }}>
            {APP_TITLE}
          </p>
          <div
            style={{
              display: "flex",
              padding: 20,
              background: "white",
              borderRadius: 24,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} width={360} height={360} alt="" />
          </div>
          <p style={{ fontSize: 18, color: "#a78bfa", margin: "24px 0 0 0" }}>
            Scanne pour t&apos;inscrire et proposer tes questions
          </p>
        </div>
      </div>
    ),
    { ...ogImageSize },
  );
}
