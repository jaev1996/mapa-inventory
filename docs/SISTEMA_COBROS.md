# Sistema de Gestión de Cobros - Documentación

## Descripción General

Sistema completo de gestión de cobros que permite a los clientes notificar pagos y a los administradores aprobar/rechazar dichos pagos. El sistema incluye validación automática de saldos, gestión de comprobantes de pago, y actualización automática del estado de las facturas.

## Arquitectura del Sistema

### Base de Datos

#### Tabla: `cobros`
```sql
- idCobro (SERIAL PRIMARY KEY)
- codigoVenta (VARCHAR, FK a ventas)
- montoCobro (DECIMAL)
- fechaCobro (TIMESTAMP)
- metodoPago (VARCHAR)
- referenciaPago (VARCHAR)
- comprobantePago (TEXT) - URL del comprobante en Supabase Storage
- estatusCobro (VARCHAR) - 'pendiente', 'confirmado', 'rechazado'
- observaciones (TEXT)
- creadoPor (INTEGER)
- aprobadoPor (INTEGER)
- fechaAprobacion (TIMESTAMP)
```

#### Vista: `vista_estado_facturas`
Vista SQL que calcula automáticamente:
- Monto total de la factura (suma de historicoventas)
- Monto pagado (suma de cobros confirmados)
- Saldo pendiente (monto total - monto pagado)
- Estatus de pago ('Pendiente', 'Pago Parcial', 'Pagada')

#### Trigger: `actualizar_estatus_venta()`
Trigger automático que:
- Se ejecuta al confirmar un pago
- Actualiza el `estatusVenta` a 'Pagada' cuando el saldo pendiente es 0
- Garantiza la integridad de los datos

### Storage

#### Bucket: `pagos`
- Almacena comprobantes de pago (imágenes JPG, PNG, PDF)
- Políticas de seguridad configuradas
- Tamaño máximo: 5MB por archivo

## Componentes del Sistema

### 1. Server Actions (`app/actions/payment-actions.ts`)

#### `getFacturasConEstado(filtro?: string)`
Obtiene todas las facturas con su estado de pago.
- **Parámetros**: filtro opcional ('pendiente', 'pagada', 'parcial')
- **Retorna**: Array de FacturaEstado

#### `registrarPago(prevState, formData)`
Registra un nuevo pago con validación de saldo.
- **Validaciones**:
  - Monto no puede exceder saldo pendiente
  - Datos válidos según CobroSchema
  - Factura existe
- **Retorna**: { message, data? }

#### `subirComprobante(file, codigoVenta)`
Sube comprobante de pago a Supabase Storage.
- **Validaciones**:
  - Tamaño máximo: 5MB
  - Formatos: JPG, PNG, PDF
- **Retorna**: { url } o { error }

#### `getPagosPendientes()`
Obtiene todos los pagos pendientes de aprobación (Admin).
- **Retorna**: Array de pagos con información de venta y cliente

#### `aprobarPago(prevState, formData)`
Confirma o rechaza un pago (Admin).
- **Acciones**:
  - Actualiza estatusCobro
  - Registra fecha de aprobación
  - Trigger actualiza automáticamente la venta si está pagada
- **Retorna**: { message, data? }

### 2. Componentes UI

#### `ListadoFacturas.tsx`
Tabla de facturas con:
- Búsqueda por código o cliente
- Filtros por estatus de pago
- Botón para registrar pago en cada factura
- Visualización de saldos

**Props**:
```typescript
{
  facturas: FacturaEstado[]
  mostrarAcciones?: boolean
}
```

#### `RegistrarPagoDialog.tsx`
Modal para registrar pagos con:
- Validación en tiempo real del monto
- Upload de comprobante
- Campos: monto, fecha, método, referencia, observaciones
- Validación: monto <= saldo pendiente

**Props**:
```typescript
{
  factura: FacturaEstado
  trigger?: React.ReactNode
}
```

#### `PanelAprobacion.tsx`
Panel administrativo para aprobar/rechazar pagos:
- Tabla de pagos pendientes
- Visualización de comprobantes
- Botones de confirmar/rechazar
- Observaciones obligatorias al rechazar

**Props**:
```typescript
{
  pagosPendientes: PagoPendiente[]
}
```

### 3. Páginas

#### `/cobros` (Cliente)
Vista del cliente para:
- Ver todas sus facturas
- Ver saldos pendientes
- Registrar pagos
- Estadísticas: total facturas, facturas pendientes, total por pagar

#### `/admin/cobros` (Administrador)
Vista del administrador con tabs:
- **Tab 1**: Pagos pendientes de aprobación
- **Tab 2**: Todas las facturas del sistema
- Estadísticas: pagos pendientes, monto pendiente aprobación, facturas con saldo, total por cobrar

## Flujo de Trabajo

### Flujo de Registro de Pago (Cliente)

1. Cliente accede a `/cobros`
2. Ve listado de facturas con saldos pendientes
3. Click en "Registrar Pago" en una factura
4. Modal se abre mostrando:
   - Saldo pendiente
   - Formulario de pago
5. Cliente ingresa:
   - Monto (validado contra saldo pendiente)
   - Fecha de pago
   - Método de pago
   - Referencia (opcional)
   - Sube comprobante (opcional)
   - Observaciones (opcional)
6. Sistema valida:
   - Monto <= saldo pendiente
   - Datos completos y válidos
7. Si válido:
   - Sube comprobante a Storage
   - Inserta registro en `cobros` con estatus 'pendiente'
   - Muestra confirmación
8. Si inválido:
   - Muestra error específico

### Flujo de Aprobación (Admin)

1. Admin accede a `/admin/cobros`
2. Ve estadísticas de pagos pendientes
3. En tab "Pagos Pendientes":
   - Lista de pagos con estatus 'pendiente'
   - Información de factura, cliente, monto
4. Admin puede:
   - Ver comprobante (si existe)
   - Confirmar pago:
     - Agrega observaciones (opcional)
     - Click en "Confirmar"
     - Sistema actualiza estatus a 'confirmado'
     - Trigger actualiza venta si está totalmente pagada
   - Rechazar pago:
     - Agrega observaciones (obligatorio)
     - Click en "Rechazar"
     - Sistema actualiza estatus a 'rechazado'
5. Página se actualiza automáticamente

## Validaciones Implementadas

### Validación de Saldo
```typescript
// Cliente no puede pagar más del saldo pendiente
if (montoCobro > factura.saldoPendiente) {
  return error
}
```

### Validación de Comprobante
```typescript
// Tamaño máximo: 5MB
if (file.size > 5 * 1024 * 1024) {
  return error
}

// Formatos permitidos
const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
```

### Validación de Schemas (Zod)
```typescript
CobroSchema: {
  codigoVenta: string (min 1)
  montoCobro: number (min 0.01)
  metodoPago: string (min 1)
  // ... otros campos opcionales
}

AprobarCobroSchema: {
  idCobro: number (min 1)
  accion: enum ['confirmar', 'rechazar']
  observaciones: string (opcional)
}
```

## Cierre Automático de Facturas

El sistema implementa un trigger que automáticamente:

1. Cuando un pago es confirmado
2. Calcula el saldo pendiente de la factura
3. Si saldo pendiente <= 0:
   - Actualiza `ventas.estatusVenta` a 'Pagada'
4. Garantiza consistencia de datos

## Seguridad

### Políticas de Storage
```sql
-- Usuarios autenticados pueden subir comprobantes
CREATE POLICY "Authenticated users can upload payment receipts"
ON storage.objects FOR INSERT TO authenticated

-- Usuarios pueden ver sus propios comprobantes
CREATE POLICY "Users can view their own payment receipts"
ON storage.objects FOR SELECT TO authenticated

-- Admins pueden ver todos los comprobantes
CREATE POLICY "Admins can view all payment receipts"
ON storage.objects FOR SELECT TO authenticated
WHERE role = 'admin'
```

### Validación de Roles
- Rutas de admin protegidas por middleware
- Server actions validan permisos
- UI condicional según rol

## Instalación y Configuración

### 1. Ejecutar Migración SQL
```bash
# Ejecutar el archivo de migración en Supabase
supabase/migrations/001_create_vista_estado_facturas.sql
```

### 2. Instalar Dependencias
```bash
npm install @radix-ui/react-toast @radix-ui/react-tabs class-variance-authority
```

### 3. Configurar Variables de Entorno
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Crear Bucket en Supabase
1. Ir a Storage en Supabase Dashboard
2. Crear bucket llamado 'pagos'
3. Configurar como privado
4. Aplicar políticas de seguridad (incluidas en migración)

## Uso

### Para Clientes
1. Navegar a "Mis Facturas y Pagos" en el sidebar
2. Ver facturas pendientes
3. Click en "Registrar Pago" en factura deseada
4. Completar formulario
5. Esperar aprobación del administrador

### Para Administradores
1. Navegar a "Gestión de Cobros" en el sidebar
2. Ver pagos pendientes en tab "Pagos Pendientes"
3. Revisar detalles y comprobante
4. Confirmar o rechazar según corresponda
5. Ver todas las facturas en tab "Todas las Facturas"

## Mejoras Futuras Sugeridas

1. **Notificaciones**:
   - Email al cliente cuando pago es aprobado/rechazado
   - Notificación al admin cuando hay nuevo pago pendiente

2. **Reportes**:
   - Exportar historial de pagos a Excel/PDF
   - Gráficos de flujo de caja
   - Análisis de métodos de pago más usados

3. **Automatización**:
   - Integración con pasarelas de pago
   - Verificación automática de transferencias bancarias
   - Recordatorios automáticos de pagos pendientes

4. **Auditoría**:
   - Log de todas las acciones
   - Historial de cambios de estatus
   - Tracking de quién aprobó/rechazó cada pago

## Soporte

Para problemas o preguntas:
1. Revisar esta documentación
2. Verificar logs en consola del navegador
3. Revisar logs de Supabase
4. Contactar al equipo de desarrollo

---

**Última actualización**: Enero 2026
**Versión**: 1.0.0
