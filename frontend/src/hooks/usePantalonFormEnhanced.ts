"use client";

import { useState, useCallback, useMemo, useContext, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/env";
import { CompanyContext } from "@/context/CompanyContext";

// Extended types for form usage (separate from API types)
export interface InsumoAPI {
  readonly referencia: number;
  readonly nombre: string;
  readonly tipo: string;
  readonly cantidad: number;
  readonly preciounidad: number;
  readonly unidad: string;
}

export interface ManoDeObraAPI {
  readonly referencia: number;
  readonly nombre: string;
  readonly precio: number;
}

export interface InsumoSeleccionado {
  readonly insumo: InsumoAPI;
  cantidadUsada: number;
}

// Tallas disponibles
export const TALLAS_DISPONIBLES = [
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
] as const;

export type TallaDisponible = (typeof TALLAS_DISPONIBLES)[number];

export function usePantalonFormEnhanced() {
  const { getToken } = useAuth();
  const context = useContext(CompanyContext);
  const selectedCompany = context?.selectedCompany || 'egl';

  // Estados básicos
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState<string>("1");
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState<string[]>([]); // Tallas seleccionadas (paso inicial)
  const [tallasConCantidades, setTallasConCantidades] = useState<Record<string, number>>({}); // Distribución por talla
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  // Estados para datos del servidor
  const [insumos, setInsumos] = useState<InsumoAPI[]>([]);
  const [manosDeObra, setManosDeObra] = useState<ManoDeObraAPI[]>([]);

  // Estados para selecciones
  const [insumosSeleccionados, setInsumosSeleccionados] = useState<
    InsumoSeleccionado[]
  >([]);
  const [manosDeObraSeleccionadas, setManosDeObraSeleccionadas] = useState<
    ManoDeObraAPI[]
  >([]); // Múltiples manos de obra

  // Memoize static data to avoid recreation on every render
  const insumosSimulados = useMemo<InsumoAPI[]>(
    () => [
      {
        referencia: 1,
        nombre: "Tela Denim Azul",
        tipo: "Tela",
        cantidad: 100,
        preciounidad: 15000,
        unidad: "metros",
      },
      {
        referencia: 2,
        nombre: "Hilo Poliéster",
        tipo: "Hilo",
        cantidad: 50,
        preciounidad: 2500,
        unidad: "rollos",
      },
      {
        referencia: 3,
        nombre: "Botones Metálicos",
        tipo: "Botones",
        cantidad: 200,
        preciounidad: 500,
        unidad: "unidades",
      },
      {
        referencia: 4,
        nombre: "Cremallera 15cm",
        tipo: "Cremallera",
        cantidad: 80,
        preciounidad: 3000,
        unidad: "unidades",
      },
      {
        referencia: 5,
        nombre: "Elástico 2cm",
        tipo: "Elástico",
        cantidad: 30,
        preciounidad: 1200,
        unidad: "metros",
      },
    ],
    []
  );

  const manosDeObraSimuladas = useMemo<ManoDeObraAPI[]>(
    () => [
      { referencia: 1, nombre: "Confección Básica", precio: 25000 },
      { referencia: 2, nombre: "Confección Premium", precio: 45000 },
      { referencia: 3, nombre: "Acabados Especiales", precio: 15000 },
      { referencia: 4, nombre: "Bordado Personalizado", precio: 20000 },
      { referencia: 5, nombre: "Aplicaciones Decorativas", precio: 18000 },
    ],
    []
  );

  // Función para cargar datos del servidor - optimized dependencies
  const cargarDatos = useCallback(async () => {
    setLoadingData(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const apiUrl = getApiUrl();

      // Cargar insumos reales desde la API
      const insumosResponse = await fetch(`${apiUrl}/insumos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Company-Id": selectedCompany,
        },
      });

      if (!insumosResponse.ok) {
        throw new Error(`Error loading insumos: ${insumosResponse.status}`);
      }

      const insumosData = await insumosResponse.json();
      
      // Cargar manos de obra reales desde la API
      const manosDeObraResponse = await fetch(`${apiUrl}/manos-de-obra`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Company-Id": selectedCompany,
        },
      });

      if (!manosDeObraResponse.ok) {
        throw new Error(`Error loading manos de obra: ${manosDeObraResponse.status}`);
      }

      const manosDeObraData = await manosDeObraResponse.json();

      setInsumos(insumosData);
      setManosDeObra(manosDeObraData);
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("Error al cargar los datos desde el servidor");
      // Fallback a datos simulados en caso de error
      setInsumos(insumosSimulados);
      setManosDeObra(manosDeObraSimuladas);
    } finally {
      setLoadingData(false);
    }
  }, [getToken, selectedCompany, insumosSimulados, manosDeObraSimuladas]);

  // Función para manejar cambio de imagen
  const manejarCambioImagen = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          // 5MB
          toast.error("La imagen no puede ser mayor a 5MB");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          setImagenPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  // Funciones para manejar insumos
  const agregarInsumo = useCallback((insumo: InsumoAPI) => {
    setInsumosSeleccionados((prev) => {
      const existe = prev.find(
        (item) => item.insumo.referencia === insumo.referencia
      );
      if (existe) {
        return prev; // Ya existe, no hacer nada
      }
      return [...prev, { insumo, cantidadUsada: 1 }];
    });
  }, []);

  const removerInsumo = useCallback((referencia: number) => {
    setInsumosSeleccionados((prev) =>
      prev.filter((item) => item.insumo.referencia !== referencia)
    );
  }, []);

  const actualizarCantidadInsumo = useCallback(
    (referencia: number, cantidad: number) => {
      setInsumosSeleccionados((prev) =>
        prev.map((item) =>
          item.insumo.referencia === referencia
            ? { ...item, cantidadUsada: Math.max(1, cantidad) } // Cambiado a 1 para asegurar enteros
            : item
        )
      );
    },
    []
  );

  // Funciones para manejar múltiples tallas
  const toggleTalla = useCallback((talla: string) => {
    setTallasSeleccionadas((prev) => {
      if (prev.includes(talla)) {
        return prev.filter((t) => t !== talla);
      } else {
        return [...prev, talla].sort(
          (a, b) => parseInt(a, 10) - parseInt(b, 10)
        );
      }
    });
  }, []);

  // Distribución automática de cantidades por talla
  const distribuirEquitativamente = useCallback(() => {
    const cantidadNum = parseInt(cantidad, 10);
    if (isNaN(cantidadNum) || cantidadNum < 1 || tallasSeleccionadas.length === 0) {
      return;
    }

    const numTallas = tallasSeleccionadas.length;
    const baseUnits = Math.floor(cantidadNum / numTallas);
    const extraUnits = cantidadNum % numTallas;

    const nuevaDistribucion: Record<string, number> = {};
    tallasSeleccionadas.forEach((talla, index) => {
      nuevaDistribucion[talla] = baseUnits + (index < extraUnits ? 1 : 0);
    });

    setTallasConCantidades(nuevaDistribucion);
  }, [cantidad, tallasSeleccionadas]);

  // Actualizar cantidad para una talla específica
  const actualizarCantidadTalla = useCallback((talla: string, nuevaCantidad: number) => {
    setTallasConCantidades((prev) => ({
      ...prev,
      [talla]: Math.max(0, nuevaCantidad), // Permitir 0 para flexibilidad
    }));
  }, []);

  // Efecto para distribuir automáticamente cuando cambian tallas o cantidad
  useEffect(() => {
    if (tallasSeleccionadas.length > 0 && cantidad) {
      const cantidadNum = parseInt(cantidad, 10);
      if (!isNaN(cantidadNum) && cantidadNum > 0) {
        // Solo redistribuir si no hay distribución previa o cambió el número de tallas
        const tallasActuales = Object.keys(tallasConCantidades).sort().join(',');
        const tallasNuevas = [...tallasSeleccionadas].sort().join(',');

        if (tallasActuales !== tallasNuevas) {
          distribuirEquitativamente();
        }
      }
    }
  }, [tallasSeleccionadas, cantidad, distribuirEquitativamente, tallasConCantidades]);

  // Funciones para manejar múltiples manos de obra
  const toggleManoDeObra = useCallback((manoDeObra: ManoDeObraAPI) => {
    setManosDeObraSeleccionadas((prev) => {
      const existe = prev.find((m) => m.referencia === manoDeObra.referencia);
      if (existe) {
        return prev.filter((m) => m.referencia !== manoDeObra.referencia);
      } else {
        return [...prev, manoDeObra];
      }
    });
  }, []);

  // Cálculo del costo total
  const costoTotal = useMemo(() => {
    const costoInsumos = insumosSeleccionados.reduce(
      (total, item) => total + item.cantidadUsada * item.insumo.preciounidad,
      0
    );

    const costoManoDeObra = manosDeObraSeleccionadas.reduce(
      (total, mano) => total + mano.precio,
      0
    );

    return costoInsumos + costoManoDeObra;
  }, [insumosSeleccionados, manosDeObraSeleccionadas]);

  // Función para limpiar formulario
  const limpiarFormulario = useCallback(() => {
    setNombre("");
    setCantidad("1");
    setTallasSeleccionadas([]);
    setImagenPreview(null);
    setInsumosSeleccionados([]);
    setManosDeObraSeleccionadas([]);
  }, []);

  // Función para validar formulario
  const validarFormulario = useCallback(() => {
    if (!nombre.trim()) {
      toast.error("El nombre del pantalón es requerido");
      return false;
    }

    const cantidadNum = parseInt(cantidad);
    if (isNaN(cantidadNum) || cantidadNum < 1) {
      toast.error("La cantidad debe ser un número válido mayor a 0");
      return false;
    }

    if (tallasSeleccionadas.length === 0) {
      toast.error("Debes seleccionar al menos una talla");
      return false;
    }

    if (insumosSeleccionados.length === 0) {
      toast.error("Debes seleccionar al menos un insumo");
      return false;
    }

    if (manosDeObraSeleccionadas.length === 0) {
      toast.error("Debes seleccionar al menos un tipo de mano de obra");
      return false;
    }

    return true;
  }, [
    nombre,
    cantidad,
    tallasSeleccionadas,
    insumosSeleccionados,
    manosDeObraSeleccionadas,
  ]);

  // --- INICIO DE LA FUNCIÓN CORREGIDA ---
  // Función para crear pantalón en el API
  const crearPantalon = useCallback(
    async (imagenFile?: File) => {
      if (!validarFormulario()) {
        return false;
      }

      setLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          throw new Error("No authentication token available");
        }

        const apiUrl = getApiUrl();
        let imageUrl = ""; // Inicializamos la URL de la imagen como vacía

        // PASO 1: Subir la imagen PRIMERO, si existe
        if (imagenFile) {
          toast.info("Subiendo imagen...");
          const formData = new FormData();
          formData.append('image', imagenFile);

          const uploadResponse = await fetch(`${apiUrl}/uploads/image`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Company-Id": selectedCompany,
            },
            body: formData,
          });

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json().catch(() => ({}));
            throw new Error(uploadError.error || `Error ${uploadResponse.status} al subir la imagen`);
          }

          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.imageUrl; // Guardamos la URL obtenida
          toast.success("Imagen subida exitosamente.");
        }

        // PASO 2: Construir el payload final con la URL de la imagen ya obtenida
        const pantalonData = {
          nombre: nombre.trim(),
          tallas_disponibles: tallasConCantidades, // Enviar objeto con cantidades por talla
          imagen_url: imageUrl, // Usamos la URL de la imagen (o la cadena vacía si no hubo subida)
          cantidad: parseInt(cantidad),
          insumos: insumosSeleccionados.map((item) => ({
            insumo_referencia: item.insumo.referencia,
            cantidad_requerida: Math.round(item.cantidadUsada),
          })),
          manos_de_obra: manosDeObraSeleccionadas.map((mano) => ({
            mano_de_obra_referencia: mano.referencia,
          })),
        };

        // PASO 3: Crear el pantalón en UNA SOLA llamada a la API
        const response = await fetch(`${apiUrl}/pantalones`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Company-Id": selectedCompany,
          },
          body: JSON.stringify(pantalonData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Error ${response.status}: ${response.statusText}`
          );
        }
        
        const pantalonCreado = await response.json();
        
        toast.success("¡Pantalón creado exitosamente!");
        limpiarFormulario();

        return pantalonCreado;
      } catch (error) {
        console.error("Error creating pantalón:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        toast.error(`Error al crear pantalón: ${errorMessage}`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [
      validarFormulario,
      getToken,
      selectedCompany,
      nombre,
      cantidad,
      tallasSeleccionadas,
      insumosSeleccionados,
      manosDeObraSeleccionadas,
      limpiarFormulario,
    ]
  );
  // --- FIN DE LA FUNCIÓN CORREGIDA ---


  return {
    loading,
    loadingData,
    insumos,
    manosDeObra,
    nombre,
    cantidad,
    tallasSeleccionadas,
    tallasConCantidades, // NUEVO: distribución por talla
    insumosSeleccionados,
    manosDeObraSeleccionadas,
    imagenPreview,
    costoTotal,

    // Constantes
    TALLAS_DISPONIBLES,

    // Acciones básicas
    setNombre,
    setCantidad,
    setTallasSeleccionadas,
    setTallasConCantidades, // NUEVO: setter para distribución
    setManosDeObraSeleccionadas,
    setImagenPreview,
    setLoading,

    // Acciones complejas
    cargarDatos,
    manejarCambioImagen,
    agregarInsumo,
    removerInsumo,
    actualizarCantidadInsumo,
    toggleTalla,
    toggleManoDeObra,
    distribuirEquitativamente, // NUEVO: función para redistribuir
    actualizarCantidadTalla, // NUEVO: actualizar cantidad de una talla
    limpiarFormulario,
    validarFormulario,
    crearPantalon,
  };
}