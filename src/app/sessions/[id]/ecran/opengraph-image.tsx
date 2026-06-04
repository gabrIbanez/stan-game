import {
  generateJoinOgImage,
  ogImageAlt,
  ogImageContentType,
  ogImageSize,
} from "@/lib/generate-join-og-image";

export const runtime = "nodejs";
export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = ogImageAlt;

type Props = { params: Promise<{ id: string }> };

export default async function EcranOpenGraphImage({ params }: Props) {
  const { id } = await params;
  return generateJoinOgImage(id);
}
