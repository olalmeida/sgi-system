# Gestio System - Sistema de Gestión Financiera y Logística

Sistema cloud-native para la digitalización de procesos operativos críticos con enfoque en finanzas y logística.

## 🚀 Características

- **Autenticación Segura**: Sistema de login/registro con Supabase Auth
- **Dashboard Financiero**: Visualización en tiempo real de liquidez y presupuestos
- **Gestión Multidivisa**: Soporte para múltiples monedas (USD, EUR, BRL, ARS)
- **Control Presupuestario**: Seguimiento proactivo de presupuestos por departamento
- **Logística Digitalizada**: Gestión de procesos operativos
- **Row Level Security (RLS)**: Seguridad a nivel de base de datos protegida por usuario

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Estilos**: Vanilla CSS con diseño glassmorphism
- **Iconos**: Lucide React

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

## ⚙️ Configuración

### 1. Clonar el repositorio

```bash
git clone <tu-repo>
cd sgi-system
```

### 2. Instalar dependencias

```bash
cd apps/web
npm install
```

### 3. Configurar variables de entorno

Edita el archivo `apps/web/.env` y agrega tu **SUPABASE_ANON_KEY**:

```env
VITE_SUPABASE_URL=https://pyrpmhwyqlcrjkeiylis.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

> 💡 Encuentra tu `anon key` en: Supabase Dashboard → Project Settings → API

### 4. Ejecutar migraciones de base de datos

1. Ve a tu panel de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Copia y pega el contenido de `supabase/migrations/01_setup_schema.sql`
5. Ejecuta el script

## 🚀 Ejecución

### Modo Desarrollo

```bash
cd apps/web
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Modo Producción

```bash
cd apps/web
npm run build
npm run preview
```

## 👤 Primer Uso

1. Accede a la aplicación
2. Haz clic en "Regístrate"
3. Crea una cuenta con tu email
4. Confirma tu email (revisa tu bandeja de entrada)
5. Inicia sesión

> 💡 **Tip**: Una vez que inicies sesión, podrás empezar a crear tus propios presupuestos, transacciones y procesos logísticos de forma privada.

## 📊 Estructura del Proyecto

```
sgi-system/
├── apps/
│   └── web/                    # Aplicación React
│       ├── src/
│       │   ├── components/     # Componentes React
│       │   │   └── auth/       # Componentes de autenticación
│       │   ├── contexts/       # Context providers
│       │   ├── lib/            # Utilidades (cliente Supabase)
│       │   ├── App.tsx         # Componente principal
│       │   └── index.css       # Estilos globales
│       └── .env                # Variables de entorno
└── supabase/
    └── migrations/             # Scripts SQL
```

## 📝 Próximos Pasos

- [ ] Integrar API de tasas de cambio en tiempo real
- [ ] Implementar CRUD completo de transacciones
- [ ] Agregar gráficos y visualizaciones avanzadas
- [ ] Módulo de reportes exportables (PDF/Excel)
- [ ] Notificaciones en tiempo real
- [ ] App móvil (React Native)

## 🤝 Contribución

Este es un proyecto privado. Para contribuir, contacta al administrador del sistema.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - mira el archivo [LICENSE](LICENSE) para detalles.

Propietario: **olalmeida-dev**
