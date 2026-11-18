import {
  Award, BookOpen, CircleCheck, Clock, GraduationCap, Heart, InfinityIcon, Lock, MessagesSquare,
  ShieldCheck, Smartphone, Sparkles, Star, Target, Users, Zap, type LucideIcon,
} from "lucide-react";
import type { HomeIcon } from "@/lib/types";

/** Icons the admin can choose for homepage cards (same list as the server). */
export const HOME_ICONS: { value: HomeIcon; label: string; Icon: LucideIcon }[] = [
  { value: "infinity", label: "Forever", Icon: InfinityIcon },
  { value: "messages", label: "Chat", Icon: MessagesSquare },
  { value: "shield", label: "Shield", Icon: ShieldCheck },
  { value: "star", label: "Star", Icon: Star },
  { value: "book", label: "Book", Icon: BookOpen },
  { value: "clock", label: "Clock", Icon: Clock },
  { value: "award", label: "Award", Icon: Award },
  { value: "users", label: "People", Icon: Users },
  { value: "heart", label: "Heart", Icon: Heart },
  { value: "zap", label: "Fast", Icon: Zap },
  { value: "target", label: "Target", Icon: Target },
  { value: "phone", label: "Phone", Icon: Smartphone },
  { value: "lock", label: "Lock", Icon: Lock },
  { value: "check", label: "Check", Icon: CircleCheck },
  { value: "sparkles", label: "Sparkles", Icon: Sparkles },
  { value: "graduation", label: "Graduation", Icon: GraduationCap },
];

export function homeIcon(name: HomeIcon): LucideIcon {
  return HOME_ICONS.find((i) => i.value === name)?.Icon ?? CircleCheck;
}
