import { useState, useCallback } from "react";

export type StepNumber = 1 | 2 | 3 | 4 | 5;

interface UseWizardNavigationProps {
  totalSteps: number;
  validateStep: (step: StepNumber) => boolean;
}

export function useWizardNavigation({
  totalSteps,
  validateStep,
}: UseWizardNavigationProps) {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [completedSteps, setCompletedSteps] = useState<StepNumber[]>([]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCompletedSteps((prev) => [
        ...prev.filter((step) => step !== currentStep),
        currentStep,
      ]);
      if (currentStep < totalSteps) {
        setCurrentStep((currentStep + 1) as StepNumber);
      }
    }
  }, [currentStep, validateStep, totalSteps]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as StepNumber);
    }
  }, [currentStep]);

  const handleStepClick = useCallback(
    (stepNumber: StepNumber) => {
      // Only allow navigation to completed steps or current step
      if (completedSteps.includes(stepNumber) || stepNumber === currentStep) {
        setCurrentStep(stepNumber);
      }
    },
    [completedSteps, currentStep]
  );

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setCompletedSteps([]);
  }, []);

  const progress = (currentStep / totalSteps) * 100;

  return {
    currentStep,
    completedSteps,
    progress,
    handleNext,
    handlePrevious,
    handleStepClick,
    resetWizard,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
  };
}
