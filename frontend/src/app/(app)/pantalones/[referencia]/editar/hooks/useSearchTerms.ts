import { useState } from "react";

interface UseSearchTermsReturn {
  insumoSearchTerm: string;
  manoObraSearchTerm: string;
  setInsumoSearchTerm: (term: string) => void;
  setManoObraSearchTerm: (term: string) => void;
  clearInsumoSearch: () => void;
  clearManoObraSearch: () => void;
  clearAllSearches: () => void;
}

export function useSearchTerms(): UseSearchTermsReturn {
  const [insumoSearchTerm, setInsumoSearchTerm] = useState("");
  const [manoObraSearchTerm, setManoObraSearchTerm] = useState("");

  const clearInsumoSearch = () => setInsumoSearchTerm("");
  const clearManoObraSearch = () => setManoObraSearchTerm("");
  const clearAllSearches = () => {
    setInsumoSearchTerm("");
    setManoObraSearchTerm("");
  };

  return {
    insumoSearchTerm,
    manoObraSearchTerm,
    setInsumoSearchTerm,
    setManoObraSearchTerm,
    clearInsumoSearch,
    clearManoObraSearch,
    clearAllSearches,
  };
}
