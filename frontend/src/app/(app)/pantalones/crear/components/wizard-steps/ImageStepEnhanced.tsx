"use client";

import { memo, useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Camera,
  Trash2,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ImageStepEnhancedProps {
  imagenPreview: string | null;
  onImagenChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImagenRemove: () => void;
  isLoading?: boolean;
}

// Constants moved outside component for better performance
const CAMERA_CONSTRAINTS = {
  video: {
    width: { ideal: 720 },
    height: { ideal: 960 },
    facingMode: "environment", // Usar cámara trasera por defecto
  },
} as const;

const IMAGE_QUALITY = 0.8;
const MODAL_RENDER_DELAY = 100;

export const ImageStepEnhanced = memo(function ImageStepEnhanced({
  imagenPreview,
  onImagenChange,
  onImagenRemove,
  isLoading = false,
}: ImageStepEnhancedProps) {
  // Prevent ESLint warning for unused isLoading parameter
  void isLoading;
  const [imageLoading, setImageLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Limpiar stream cuando se desmonta el componente
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const iniciarCamara = useCallback(async () => {
    // Verificar si el navegador soporta getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Tu navegador no soporta acceso a la cámara");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        CAMERA_CONSTRAINTS
      );

      setStream(mediaStream);
      setShowCamera(true);

      // Esperar un poco para que el modal se renderice
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, MODAL_RENDER_DELAY);

      toast.success("Cámara iniciada correctamente");
    } catch (error) {
      let errorMessage = "No se pudo acceder a la cámara.";

      if (error instanceof Error) {
        switch (error.name) {
          case "NotAllowedError":
            errorMessage =
              "Permisos de cámara denegados. Permite el acceso en tu navegador.";
            break;
          case "NotFoundError":
            errorMessage = "No se encontró ninguna cámara en tu dispositivo.";
            break;
          case "NotReadableError":
            errorMessage = "La cámara está siendo usada por otra aplicación.";
            break;
          case "OverconstrainedError":
            errorMessage =
              "La configuración de cámara solicitada no es compatible.";
            break;
          default:
            errorMessage = `Error de cámara: ${error.message}`;
        }
      }

      toast.error(errorMessage);
    }
  }, []);

  const cerrarCamara = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  }, [stream]);

  const tomarFoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Error al acceder a la cámara");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      toast.error("Error al procesar la imagen");
      return;
    }

    // Verificar que el video tenga dimensiones válidas
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error(
        "El video no está listo. Espera un momento e intenta de nuevo."
      );
      return;
    }

    // Configurar el canvas con las dimensiones del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a blob y crear URL
    canvas.toBlob(
      (blob) => {
        if (blob) {
          // Simular evento de cambio de archivo para mantener compatibilidad
          const file = new File([blob], "camera-photo.jpg", {
            type: "image/jpeg",
          });

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);

          const fakeEvent = {
            target: {
              files: dataTransfer.files,
            },
          } as React.ChangeEvent<HTMLInputElement>;

          onImagenChange(fakeEvent);
          cerrarCamara();
          toast.success("¡Foto capturada exitosamente!");
        } else {
          toast.error("Error al procesar la foto capturada");
        }
      },
      "image/jpeg",
      IMAGE_QUALITY
    );
  }, [onImagenChange, cerrarCamara]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    toast.error("Error al cargar la imagen");
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent rounded-lg">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                Imagen del Producto
              </h4>
              <p className="text-sm text-muted-foreground">
                Sube una foto del pantalón para identificarlo fácilmente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subir Imagen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Selecciona una imagen del producto</Label>
            <div className="mt-2 space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("imagen-input")?.click()
                  }
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Subir Imagen
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={iniciarCamara}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Tomar Foto
                </Button>
              </div>

              <input
                id="imagen-input"
                type="file"
                accept="image/*"
                onChange={onImagenChange}
                className="hidden"
                aria-label="Seleccionar imagen del producto"
              />

              <p className="text-xs text-muted-foreground">
                Formatos soportados: JPG, PNG, WEBP. Tamaño máximo: 5MB
              </p>
            </div>
          </div>

          {/* Preview Section */}
          {imagenPreview ? (
            <div className="space-y-3">
              <Label>Vista Previa</Label>
              <div className="relative w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden border">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                <Image
                  src={imagenPreview}
                  alt="Vista previa del producto"
                  fill
                  className="object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  onLoadStart={() => setImageLoading(true)}
                  priority={false}
                  quality={85}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={onImagenRemove}
                  aria-label="Eliminar imagen"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h5 className="text-lg font-medium text-foreground mb-2">
                No hay imagen seleccionada
              </h5>
              <p className="text-muted-foreground text-sm">
                La imagen es opcional, pero ayuda a identificar el producto
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Cámara */}
      {showCamera && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="camera-modal-title"
        >
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full mx-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3
                id="camera-modal-title"
                className="text-lg font-semibold text-foreground"
              >
                Tomar Foto
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={cerrarCamara}
                className="p-2"
                aria-label="Cerrar cámara"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Video Preview */}
              <div className="relative bg-black rounded-lg overflow-hidden aspect-[3/4]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  aria-label="Vista previa de la cámara"
                />
              </div>

              {/* Controles */}
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={cerrarCamara}
                  className="flex items-center gap-2"
                  aria-label="Cancelar captura de foto"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={tomarFoto}
                  className="flex items-center gap-2"
                  aria-label="Capturar foto del producto"
                >
                  <Camera className="h-4 w-4" />
                  Capturar Foto
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Asegúrate de que el producto esté bien iluminado y centrado
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Canvas oculto para capturar la foto */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
});
