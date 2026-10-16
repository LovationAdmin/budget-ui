// src/components/help/parts.tsx
// Building blocks of the help articles (src/components/help/articles.<lang>.tsx).

import type { ReactNode } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface HelpArticle {
  id: string;
  category: string;
  icon: any;
  title: string;
  description: string;
  content: ReactNode;
  tags: string[];
}

// ============================================================================
// HELPER COMPONENT: Keyboard Shortcut Badge
// ============================================================================

export function KBD({ children }: { children: ReactNode }) {
  return (
    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm">
      {children}
    </kbd>
  );
}

// ============================================================================
// HELPER COMPONENT: Feature Box
// ============================================================================

export function FeatureBox({ icon: Icon, title, children, color = "blue" }: { 
  icon: any; 
  title: string; 
  children: ReactNode;
  color?: "blue" | "green" | "orange" | "purple" | "red" | "gray";
}) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    purple: "bg-purple-50 border-purple-200 text-purple-800",
    red: "bg-red-50 border-red-200 text-red-800",
    gray: "bg-gray-50 border-gray-200 text-gray-800",
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <div className="text-xs">{children}</div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENT: Step by Step Guide
// ============================================================================

export function StepGuide({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={index} className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
            {index + 1}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">{step.title}</p>
            <p className="text-xs text-gray-600 mt-0.5">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

