import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "@/config/clerk-theme";

export default function LoginPage() {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-wrap lg:flex-nowrap max-w-7xl w-full gap-12 lg:gap-20 items-center justify-center px-6 py-12">
        {/* Left side - Branding and description */}
        <div className="flex flex-col gap-6 max-w-xl text-center lg:text-left">
          {/* Logo/Badge */}
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              EG
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-900">EGL SAS</h2>
              <p className="text-sm text-gray-600">Sistema de Inventario</p>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Bienvenido a tu
            <span className="block mt-2 text-blue-600">Sistema de Gestión</span>
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-700 leading-relaxed">
            Gestiona inventarios de insumos y pantalones, controla lotes y
            procesos de manera eficiente y centralizada.
          </p>

          {/* Features list */}
          <div className="flex flex-col gap-3 mt-4">
            <FeatureItem icon="📦" text="Control de inventarios en tiempo real" />
            <FeatureItem icon="🏭" text="Gestión de procesos y lotes" />
            <FeatureItem icon="📊" text="Reportes y análisis detallados" />
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-auto flex justify-center">
          <div className="w-full max-w-md">
            <SignIn
              fallbackRedirectUrl="/dashboard"
              appearance={clerkAppearance}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature item component
function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 text-left">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl">
        {icon}
      </div>
      <p className="text-gray-700 font-medium">{text}</p>
    </div>
  );
}
