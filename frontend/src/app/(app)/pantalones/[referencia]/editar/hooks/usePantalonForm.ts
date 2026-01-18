import { useState, useCallback } from "react";
import { toast } from "sonner";

interface InsumoSeleccionado {
  referencia: string;
  nombre: string;
  cantidad_usada: number;
  precio_unitario: number;
}

interface ManoDeObraSeleccionada {
  referencia: string;
  nombre: string;
  precio: number;
}

interface UsePantalonFormOptions {
  initialData?: {
    nombre?: string;
    cantidad?: number;
    tallasSeleccionadas?: string[];
    insumosSeleccionados?: InsumoSeleccionado[];
    manosDeObraSeleccionadas?: ManoDeObraSeleccionada[];
    imagenPreview?: string | null;
  };
}

export function usePantalonForm(options: UsePantalonFormOptions = {}) {
  const { initialData = {} } = options;

  // Form state
  const [nombre, setNombre] = useState(initialData.nombre || "");
  const [cantidad, setCantidad] = useState(initialData.cantidad || 1);
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState<string[]>(
    initialData.tallasSeleccionadas || []
  );
  const [insumosSeleccionados, setInsumosSeleccionados] = useState<InsumoSeleccionado[]>(
    initialData.insumosSeleccionados || []
  );
  const [manosDeObraSeleccionadas, setManosDeObraSeleccionadas] = useState<ManoDeObraSeleccionada[]>(
    initialData.manosDeObraSeleccionadas || []
  );
  const [imagenPreview, setImagenPreview] = useState<string | null>(
    initialData.imagenPreview || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Handlers for tallas
  const handleAddTalla = useCallback((talla: string) => {
    const tallaTrimmed = talla.trim();
    if (tallaTrimmed && !tallasSeleccionadas.includes(tallaTrimmed)) {
      setTallasSeleccionadas(prev => 
        [...prev, tallaTrimmed].sort((a, b) => Number(a) - Number(b))
      );
    }
  }, [tallasSeleccionadas]);

  const handleRemoveTalla = useCallback((talla: string) => {
    setTallasSeleccionadas(prev => prev.filter(t => t !== talla));
  }, []);

  const handleToggleTalla = useCallback((talla: string) => {
    setTallasSeleccionadas(prev => {
      const isSelected = prev.includes(talla);
      if (isSelected) {
        return prev.filter(t => t !== talla);
      } else {
        return [...prev, talla].sort((a, b) => Number(a) - Number(b));
      }
    });
  }, []);

  // Handlers for insumos
  const handleAddInsumo = useCallback((insumo: InsumoSeleccionado) => {
    const exists = insumosSeleccionados.find(i => i.referencia === insumo.referencia);
    if (!exists) {
      setInsumosSeleccionados(prev => [...prev, insumo]);
    }
  }, [insumosSeleccionados]);

  const handleRemoveInsumo = useCallback((referencia: string) => {
    setInsumosSeleccionados(prev => prev.filter(i => i.referencia !== referencia));
  }, []);

  const handleInsumoQuantityChange = useCallback((referencia: string, cantidad: number) => {
    setInsumosSeleccionados(prev => 
      prev.map(insumo => 
        insumo.referencia === referencia 
          ? { ...insumo, cantidad_usada: cantidad }
          : insumo
      )
    );
  }, []);

  // Handlers for mano de obra
  const handleAddManoObra = useCallback((manoObra: ManoDeObraSeleccionada) => {
    const exists = manosDeObraSeleccionadas.find(m => m.referencia === manoObra.referencia);
    if (!exists) {
      setManosDeObraSeleccionadas(prev => [...prev, manoObra]);
    }
  }, [manosDeObraSeleccionadas]);

  const handleRemoveManoObra = useCallback((referencia: string) => {
    setManosDeObraSeleccionadas(prev => prev.filter(m => m.referencia !== referencia));
  }, []);

  // Image handlers
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen debe ser menor a 5MB");
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        toast.error("Solo se permiten archivos de imagen");
        return;
      }

      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagenPreview(preview);
    }
  }, []);

  const handleRemoveImage = useCallback((fallbackUrl?: string) => {
    setImageFile(null);
    setImagenPreview(fallbackUrl || null);
  }, []);

  // Validation
  const validateForm = useCallback(() => {
    if (!nombre.trim()) {
      toast.error("El nombre es requerido");
      return false;
    }

    if (tallasSeleccionadas.length === 0) {
      toast.error("Debe seleccionar al menos una talla");
      return false;
    }

    if (insumosSeleccionados.length === 0) {
      toast.error("Debe seleccionar al menos un insumo");
      return false;
    }

    if (manosDeObraSeleccionadas.length === 0) {
      toast.error("Debe seleccionar al menos un proceso de mano de obra");
      return false;
    }

    return true;
  }, [nombre, tallasSeleccionadas, insumosSeleccionados, manosDeObraSeleccionadas]);

  // Get form data
  const getFormData = useCallback(() => {
    return {
      nombre: nombre.trim(),
      cantidad,
      tallasSeleccionadas,
      insumosSeleccionados,
      manosDeObraSeleccionadas,
      imageFile,
      imagenPreview,
    };
  }, [nombre, cantidad, tallasSeleccionadas, insumosSeleccionados, manosDeObraSeleccionadas, imageFile, imagenPreview]);

  // Reset form
  const resetForm = useCallback(() => {
    setNombre("");
    setCantidad(1);
    setTallasSeleccionadas([]);
    setInsumosSeleccionados([]);
    setManosDeObraSeleccionadas([]);
    setImagenPreview(null);
    setImageFile(null);
  }, []);

  // Update form with data
  const updateFormData = useCallback((data: {
    nombre?: string;
    cantidad?: number | string;
    tallas_disponibles?: string[];
    imagen_url?: string;
    insumos?: Array<{
      referencia: number;
      nombre: string;
      preciounidad: string;
      PantalonInsumo?: { cantidad_usada: number };
    }>;
    procesos?: Array<{
      referencia: number;
      nombre: string;
      precio: number;
    }>;
  }) => {
    if (data.nombre) setNombre(data.nombre);
    if (data.cantidad) setCantidad(parseInt(String(data.cantidad)) || 1);
    if (data.tallas_disponibles) setTallasSeleccionadas(data.tallas_disponibles);
    if (data.imagen_url) setImagenPreview(data.imagen_url);

    // Update insumos
    if (data.insumos) {
      const insumosFormateados = data.insumos.map((insumo) => ({
        referencia: insumo.referencia.toString(),
        nombre: insumo.nombre,
        cantidad_usada: insumo.PantalonInsumo?.cantidad_usada || 0,
        precio_unitario: parseFloat(insumo.preciounidad) || 0,
      }));
      setInsumosSeleccionados(insumosFormateados);
    }

    // Update mano de obra
    if (data.procesos) {
      const manosFormateadas = data.procesos.map((proceso) => ({
        referencia: proceso.referencia.toString(),
        nombre: proceso.nombre,
        precio: proceso.precio || 0,
      }));
      setManosDeObraSeleccionadas(manosFormateadas);
    }
  }, []);

  return {
    // State
    formData: {
      nombre,
      cantidad,
      tallasSeleccionadas,
      insumosSeleccionados,
      manosDeObraSeleccionadas,
      imagenPreview,
      imageFile,
    },
    // Setters
    setNombre,
    setCantidad,
    setImagenPreview,
    // Handlers
    handleAddTalla,
    handleRemoveTalla,
    handleToggleTalla,
    handleAddInsumo,
    handleRemoveInsumo,
    handleInsumoQuantityChange,
    handleAddManoObra,
    handleRemoveManoObra,
    handleFileSelect,
    handleRemoveImage,
    // Utils
    validateForm,
    getFormData,
    resetForm,
    updateFormData,
  };
}
