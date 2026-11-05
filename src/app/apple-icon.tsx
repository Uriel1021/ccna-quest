import { ImageResponse } from "next/og";
export const dynamic = "force-static";
import { AppIcon } from "@/components/brand/AppIcon";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export default function AppleIcon() {
  return new ImageResponse(<AppIcon size={180} maskable />, size);
}
