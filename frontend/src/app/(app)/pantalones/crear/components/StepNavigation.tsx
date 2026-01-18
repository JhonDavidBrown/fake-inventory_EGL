"use client";

import { memo } from "react";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepNavigationProps {
  steps: readonly Step[];
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepNumber: number) => void;
}

export const StepNavigation = memo(function StepNavigation({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: StepNavigationProps) {
  return (
    <div className="mb-6 sm:mb-8">
      {/* Mobile: Simple dots indicator */}
      <div className="flex sm:hidden justify-center items-center gap-2 py-4">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              step.id === currentStep
                ? "bg-slate-800 scale-125"
                : completedSteps.includes(step.id)
                ? "bg-slate-600"
                : "bg-slate-300"
            }`}
            disabled={
              !completedSteps.includes(step.id) && step.id !== currentStep
            }
            aria-label={`Ir al paso ${step.id}: ${step.title}`}
          />
        ))}
      </div>

      {/* Desktop: Full width */}
      <div className="hidden sm:flex justify-between items-center p-4 bg-card rounded-lg border">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`flex flex-col items-center space-y-2 px-3 py-2 rounded-lg transition-colors ${
              step.id === currentStep
                ? "bg-accent text-primary"
                : completedSteps.includes(step.id)
                ? "text-primary hover:bg-accent/50"
                : "text-muted-foreground"
            }`}
            disabled={
              !completedSteps.includes(step.id) && step.id !== currentStep
            }
            aria-current={step.id === currentStep ? "step" : undefined}
            aria-label={`Paso ${step.id}: ${step.title}${
              completedSteps.includes(step.id) ? " (completado)" : ""
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-semibold ${
                step.id === currentStep
                  ? "bg-slate-800 text-white"
                  : completedSteps.includes(step.id)
                  ? "bg-slate-700 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {step.id}
            </div>
            <span className="text-sm font-medium text-center">
              {step.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
});
