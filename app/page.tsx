import Link from "next/link";
import { Box, Package, TrendingUp, Users, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 dark:from-zinc-950 dark:to-zinc-900">
      {/* Header/Navbar */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-zinc-950/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Mapa
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#servicios" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Servicios
            </a>
            <a href="#caracteristicas" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Características
            </a>
            <a href="#contacto" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Contacto
            </a>
          </nav>
          <Link href="/login">
            <Button>Iniciar Sesión</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            Sistema de Gestión Empresarial
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Gestiona tu inventario y ventas de forma inteligente
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Mapa es la solución completa para administrar tu inventario de repuestos,
            controlar ventas y optimizar tu equipo de trabajo en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Acceder al Portal
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Crear Cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="container mx-auto px-4 py-20 bg-white dark:bg-zinc-950">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Todo lo que necesitas en un solo sistema
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Potencia tu negocio con herramientas diseñadas para la eficiencia
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <Package className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Gestión de Inventario</CardTitle>
              <CardDescription>
                Control total de repuestos con alertas de stock bajo y valoración automática
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Análisis de Ventas</CardTitle>
              <CardDescription>
                Dashboards interactivos con estadísticas en tiempo real y reportes mensuales
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <Users className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Gestión de Equipos</CardTitle>
              <CardDescription>
                Administra vendedores, clientes y asigna roles con permisos personalizados
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <Shield className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Seguridad Avanzada</CardTitle>
              <CardDescription>
                Autenticación segura y control de acceso basado en roles
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <Clock className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Historial Completo</CardTitle>
              <CardDescription>
                Seguimiento detallado de todas las transacciones y movimientos
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <Box className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Multi-ubicación</CardTitle>
              <CardDescription>
                Gestiona inventario en múltiples ubicaciones desde un solo panel
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Soluciones integrales para tu negocio
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Para Administradores</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    Dashboard completo con métricas clave
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    Gestión de inventario y precios
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    Control de vendedores y clientes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    Reportes y exportación de datos
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Para Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    Catálogo de repuestos actualizado
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    Historial de compras
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    Seguimiento de pagos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    Soporte técnico directo
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-linear-to-r from-blue-600 to-blue-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para optimizar tu negocio?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Únete a las empresas que confían en Mapa para gestionar su inventario
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="border-t bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Box className="h-6 w-6 text-blue-600" />
                <span className="text-xl font-bold">Mapa</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Sistema de gestión de inventario y ventas
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#caracteristicas" className="hover:text-blue-600">Características</a></li>
                <li><a href="#servicios" className="hover:text-blue-600">Servicios</a></li>
                <li><a href="#" className="hover:text-blue-600">Precios</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-blue-600">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600">Carreras</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-blue-600">Contacto</a></li>
                <li><a href="#" className="hover:text-blue-600">Estado del Sistema</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-12 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>© 2026 Mapa. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
