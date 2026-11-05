import { ImageResponse } from "next/og";
export const dynamic = "force-static";
import { AppIcon } from "@/components/brand/AppIcon";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(<AppIcon size={64} />, size);
}
