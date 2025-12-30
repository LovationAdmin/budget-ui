// src/components/budget/MemberAvatar.tsx - VERSION OPTIMISÉE
import { memo } from "react";
import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  name: string;
  image?: string;
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

// ============================================================================
// 🚀 OPTIMISATION : React.memo pour MemberAvatar
// ============================================================================
// Ce composant est utilisé partout (BudgetNavbar, listes de membres, etc.)
// React.memo évite les re-renders inutiles quand les props ne changent pas

export const MemberAvatar = memo(function MemberAvatar({
  name,
  image,
  size = "md",
  showRing = false,
  className,
}: MemberAvatarProps) {
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

  // 2. Render Gradient or Default Hash
  const colorClass = !image ? colors[getColorIndex(name)] : "";
  
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full font-medium text-primary-foreground shadow-soft",
        !isGradient && "bg-gradient-to-br",
        !isGradient && colorClass,
        sizeClasses[size],
        showRing && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
        className
      )}
      style={isGradient ? { background: image } : undefined}
    >
      {getInitials(name)}
    </div>
  );
}, (prevProps, nextProps) => {
  // Comparaison personnalisée : ne re-render que si les props changent vraiment
  return (
    prevProps.name === nextProps.name &&
    prevProps.image === nextProps.image &&
    prevProps.size === nextProps.size &&
    prevProps.showRing === nextProps.showRing &&
    prevProps.className === nextProps.className
  );
});

MemberAvatar.displayName = 'MemberAvatar';

// ============================================================================
// 🚀 OPTIMISATION : React.memo pour MemberAvatarGroup
// ============================================================================

interface MemberAvatarGroupProps {
  members: { name: string; image?: string }[];
  max?: number;
  size?: "sm" | "md" | "lg";
}

export const MemberAvatarGroup = memo(function MemberAvatarGroup({
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
          key={`${member.name}-${index}`}
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
}, (prevProps, nextProps) => {
  // Comparaison shallow pour la liste de membres
  if (prevProps.members.length !== nextProps.members.length) return false;
  if (prevProps.max !== nextProps.max) return false;
  if (prevProps.size !== nextProps.size) return false;
  
  // Comparer chaque membre
  for (let i = 0; i < prevProps.members.length; i++) {
    if (
      prevProps.members[i].name !== nextProps.members[i].name ||
      prevProps.members[i].image !== nextProps.members[i].image
    ) {
      return false;
    }
  }
  
  return true;
});

MemberAvatarGroup.displayName = 'MemberAvatarGroup';