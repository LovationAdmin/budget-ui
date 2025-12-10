import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  name: string;
  image?: string; // Can be URL, Base64, or Gradient CSS
  size?: "sm" | "md" | "lg";
  showRing?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const colors = [
  "from-primary to-[hsl(35_90%_65%)]",
  "from-secondary to-[hsl(200_60%_55%)]",
  "from-[hsl(260_60%_60%)] to-[hsl(300_50%_60%)]",
  "from-success to-[hsl(120_50%_50%)]",
  "from-warning to-[hsl(20_90%_55%)]",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColorIndex(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % colors.length;
}

export function MemberAvatar({
  name,
  image,
  size = "md",
  showRing = false,
  className,
}: MemberAvatarProps) {
  // Logic to determine if 'image' is a CSS gradient or a real image
  const isGradient = image?.startsWith("linear-gradient");
  const isRealImage = image && !isGradient;

  // 1. Render Real Image (Photo)
  if (isRealImage) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-full bg-muted",
          sizeClasses[size],
          showRing && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
          className
        )}
      >
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  // 2. Render Gradient (Custom Preset) or Default Hash
  const colorClass = !image ? colors[getColorIndex(name)] : "";
  
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full font-medium text-primary-foreground shadow-soft",
        // Only apply default bg-gradient class if no custom gradient is provided
        !isGradient && "bg-gradient-to-br",
        !isGradient && colorClass,
        sizeClasses[size],
        showRing && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
        className
      )}
      // Apply custom gradient directly to style
      style={isGradient ? { background: image } : undefined}
    >
      {getInitials(name)}
    </div>
  );
}

interface MemberAvatarGroupProps {
  members: { name: string; image?: string }[];
  max?: number;
  size?: "sm" | "md" | "lg";
}

export function MemberAvatarGroup({
  members,
  max = 4,
  size = "md",
}: MemberAvatarGroupProps) {
  const visibleMembers = members.slice(0, max);
  const remaining = members.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleMembers.map((member, index) => (
        <MemberAvatar
          key={index}
          name={member.name}
          image={member.image}
          size={size}
          className="ring-2 ring-background"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background",
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}