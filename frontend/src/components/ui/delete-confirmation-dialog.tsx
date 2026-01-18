"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  itemName: string;
  requiredReference: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  itemName,
  requiredReference,
  onConfirm,
  isLoading = false,
}: DeleteConfirmationDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const isMatchingReference = inputValue.trim() === String(requiredReference).trim();

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setInputValue("");
    }
    onOpenChange(newOpen);
  };

  const handleConfirm = () => {
    if (isMatchingReference) {
      onConfirm();
      setInputValue("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 border border-muted rounded-lg p-4">
            <p className="text-sm font-medium text-foreground mb-2">
              Item a eliminar:
            </p>
            <p className="text-sm text-muted-foreground font-mono">
              {itemName} (Referencia: {String(requiredReference)})
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmation-input" className="text-sm font-medium">
              Para confirmar, escribe la referencia{" "}
              <span className="font-mono text-destructive">
                {String(requiredReference)}
              </span>
            </Label>
            <Input
              id="confirmation-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Escribe ${String(requiredReference)}`}
              className={
                inputValue && !isMatchingReference
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
              disabled={isLoading}
              autoComplete="off"
            />
            {inputValue && !isMatchingReference && (
              <p className="text-xs text-destructive">
                La referencia no coincide
              </p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isMatchingReference || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Eliminando..." : "Eliminar permanentemente"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}