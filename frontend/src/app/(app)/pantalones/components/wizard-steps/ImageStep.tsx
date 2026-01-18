"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Trash2,
  X,
  Check,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImageStepProps {
  imagenPreview: string | null;
  onImagenChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onImagenRemove: () => void;
}

// Constants for better maintainability
const ACCEPTED_IMAGE_TYPES = "image/*" as const;
const MAX_FILE_SIZE = "5MB" as const;
const SUPPORTED_FORMATS = "JPG, PNG, WEBP" as const;

export function ImageStep({
  imagenPreview,
  onImagenChange,
  onImagenRemove,
}: ImageStepProps) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup effect for camera stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const abrirCamara = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment", // Usar cámara trasera por defecto
        },
      });

      setStream(mediaStream);
      setCameraOpen(true);

      // Esperar un poco para que el video se monte
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      toast.error("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  }, []);

  const cerrarCamara = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraOpen(false);
    setCapturedPhoto(null);
  }, [stream]);

  const tomarFoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Configurar el canvas con las dimensiones del video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dibujar el frame actual del video en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir a base64
    const photoDataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedPhoto(photoDataUrl);

    toast.success("¡Foto capturada!");
  }, []);

  const confirmarFoto = useCallback(() => {
    if (!capturedPhoto) return;

    // Crear un evento sintético para simular la carga de archivo
    const blob = dataURLtoBlob(capturedPhoto);
    const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });

    // Create a proper FileList-like object
    const fileList = {
      0: file,
      length: 1,
      item: (index: number) => (index === 0 ? file : null),
      [Symbol.iterator]: function* () {
        yield file;
      },
    } as FileList;

    // Create a synthetic event with proper typing
    const syntheticEvent = {
      target: { files: fileList },
      currentTarget: { files: fileList },
    } as React.ChangeEvent<HTMLInputElement>;

    onImagenChange(syntheticEvent);
    cerrarCamara();
    toast.success("Foto agregada al pantalón");
  }, [capturedPhoto, onImagenChange, cerrarCamara]);

  const descartarFoto = useCallback(() => {
    setCapturedPhoto(null);
  }, []);

  // Función auxiliar para convertir dataURL a Blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent rounded-lg">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">
                Imagen del Producto
              </h4>
              <p className="text-sm text-muted-foreground">
                Agrega una foto para mostrar cómo se ve el pantalón
              </p>
            </div>
          </div>

          {!imagenPreview ? (
            <div className="space-y-6">
              {/* Área de subida de imagen */}
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary/30 transition-colors">
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>

                  <div>
                    <h5 className="text-lg font-medium text-foreground mb-2">
                      Sube una imagen del pantalón
                    </h5>
                    <p className="text-muted-foreground mb-4">
                      Formatos soportados: {SUPPORTED_FORMATS} (máx.{" "}
                      {MAX_FILE_SIZE})
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("imagen-input")?.click()
                      }
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Subir desde archivo
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={abrirCamara}
                      className="flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Tomar foto
                    </Button>
                  </div>
                </div>
              </div>

              {/* MODIFICADO: Se añade aria-label para accesibilidad */}
              <input
                id="imagen-input"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                onChange={onImagenChange}
                className="hidden"
                aria-label="Subir imagen del pantalón desde archivo"
              />

              <div className="bg-accent/30 p-4 rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Consejo:</strong> Una buena imagen ayuda a identificar
                  rápidamente el producto. Puedes omitir este paso si no tienes
                  una imagen disponible.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview de la imagen */}
              <div className="relative">
                <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={imagenPreview}
                    alt="Preview del pantalón"
                    fill
                    className="object-cover"
                  />
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-3 right-3"
                  onClick={onImagenRemove}
                  aria-label="Eliminar imagen actual"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Opciones para cambiar imagen */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById("imagen-input-replace")?.click()
                  }
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Cambiar imagen
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={abrirCamara}
                  className="flex items-center gap-2"
                >
                  <Camera className="h-4 w-4" />
                  Tomar nueva foto
                </Button>
              </div>

              {/* MODIFICADO: Se añade aria-label para accesibilidad */}
              <input
                id="imagen-input-replace"
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                onChange={onImagenChange}
                className="hidden"
                aria-label="Reemplazar imagen del pantalón desde archivo"
              />

              <div className="bg-accent/30 p-4 rounded-lg">
                <p className="text-sm text-foreground">
                  ✓ Imagen cargada correctamente. Puedes continuar al siguiente
                  paso o cambiar la imagen si lo deseas.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de la cámara */}
      <Dialog open={cameraOpen} onOpenChange={cerrarCamara}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] max-h-none overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Tomar Foto del Pantalón
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-4">
            {!capturedPhoto ? (
              // Vista de la cámara
              <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Canvas oculto para capturar la foto */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Controles de la cámara */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cerrarCamara}
                      className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>

                    <Button
                      size="lg"
                      onClick={tomarFoto}
                      className="bg-white text-black hover:bg-gray-200 rounded-full w-16 h-16 p-0"
                      aria-label="Tomar foto"
                    >
                      <Camera className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                {/* Indicador de ayuda */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black/50 text-white px-3 py-2 rounded-lg text-sm">
                    Posiciona el pantalón en el centro y presiona el botón para
                    capturar
                  </div>
                </div>
              </div>
            ) : (
              // Vista previa de la foto capturada
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
                  <Image
                    src={capturedPhoto}
                    alt="Foto capturada"
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Controles para la foto capturada */}
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={descartarFoto}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Tomar otra
                  </Button>

                  <Button
                    onClick={confirmarFoto}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Usar esta foto
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    ¿Te gusta cómo quedó la foto? Puedes usarla o tomar otra.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}