import { ImageResponse } from "next/og";
import { AppIcon } from "@/components/brand/AppIcon";

export const dynamic = "force-static";
export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }, { size: "maskable-512" }, { size: "maskable-1024" }];
}

export async function GET(_: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const maskable = size.startsWith("maskable");
  const px = Number(size.replace("maskable-", "")) || 512;
  return new ImageResponse(<AppIcon size={px} maskable={maskable} />, { width: px, height: px });
}
