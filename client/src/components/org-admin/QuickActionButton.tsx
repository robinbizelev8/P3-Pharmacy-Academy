import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface QuickActionButtonProps {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
}

export function QuickActionButton({
  label,
  icon: Icon,
  onClick,
  variant = "default"
}: QuickActionButtonProps) {
  return (
    <Button onClick={onClick} variant={variant} className="w-full sm:w-auto">
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
