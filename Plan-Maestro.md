# PLAN DE DESARROLLO Y ARQUITECTURA: BIZTRACKER (ROI & SUBSCRIPTIONS)

## 1. CONTEXTO Y DESCRIPCIÓN DEL PROYECTO
**Objetivo:** Desarrollar una aplicación web (SaaS B2B ligero) orientada a dueños de pequeños negocios (cafeterías, artesanos, freelancers) que centraliza el control de sus finanzas básicas. 
**Problema a resolver:** Los emprendedores usan herramientas complejas o calculan a ojo, perdiendo dinero por suscripciones fantasmas o márgenes de venta mal calculados.
**Solución:** Un panel intuitivo que incluye dos módulos core:
1. **Gestor de Suscripciones:** CRUD para controlar gastos fijos en herramientas, con dashboard de gastos mensuales/anuales.
2. **Calculadora de Rentabilidad (ROI):** Herramienta dinámica para calcular precios de venta de productos basándose en costos de materiales, horas invertidas y margen de ganancia deseado.

## 2. STACK TECNOLÓGICO Y ARQUITECTURA
* **Framework Frontend/Backend:** Next.js (App Router).
* **Estilos y UI:** Tailwind CSS, Shadcn/UI (recomendado para componentes rápidos y accesibles) y Lucide Icons.
* **Gráficos:** Recharts o Chart.js (para gráficos circulares y de barras en el Dashboard).
* **Base de Datos y Autenticación:** Supabase (PostgreSQL).
* **Control de Versiones:** Git y repositorio en GitHub.
* **Despliegue (sugerido):** Vercel.

## 3. SISTEMA DE AUTENTICACIÓN Y SEGURIDAD
* **Proveedor:** Supabase Auth (Email y Contraseña).
* **Aislamiento de Datos:** Uso estricto de **Row Level Security (RLS)** en PostgreSQL para garantizar que cada usuario (emprendedor) solo pueda visualizar, editar y eliminar sus propios registros.

## 4. ESQUEMA DE BASE DE DATOS (SQL)
Ejecutar este script en el SQL Editor de Supabase para inicializar la base de datos, habilitar RLS y crear las políticas de seguridad.

```sql
-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Perfiles (Se sincroniza con auth.users de Supabase)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    business_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Tabla de Suscripciones Activas
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- Ej: "Adobe CC", "Canva"
    cost DECIMAL(10, 2) NOT NULL,
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')) NOT NULL,
    next_payment_date DATE,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Tabla de Productos/Calculadora ROI
CREATE TABLE products_roi (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT NOT NULL,
    material_cost DECIMAL(10, 2) NOT NULL,
    time_invested_hours DECIMAL(5, 2) NOT NULL,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    desired_margin_percent INTEGER NOT NULL,
    suggested_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_roi ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE SEGURIDAD (Cada usuario ve solo lo suyo)
-- Perfiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Suscripciones
CREATE POLICY "Users can CRUD own subscriptions" ON subscriptions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Productos ROI
CREATE POLICY "Users can CRUD own products" ON products_roi
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## 5. ESTRUCTURA DEL PROYECTO (NEXT.JS APP ROUTER)
Organización de carpetas esperada:

```plaintext
/
├── src/
│   ├── app/                  # Rutas principales (Next.js App Router)
│   │   ├── (auth)/           # Grupo de rutas de autenticación
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── dashboard/        # Panel de control privado
│   │   │   ├── page.tsx      # Resumen (Gráficos, KPIs totales)
│   │   │   ├── subscriptions/# CRUD de suscripciones
│   │   │   └── roi-calc/     # Calculadora y lista de productos
│   │   ├── layout.tsx        # Layout principal (Navbar/Sidebar)
│   │   └── page.tsx          # Landing page (Marketing)
│   ├── components/           # Componentes UI reutilizables
│   │   ├── ui/               # Botones, Inputs, Modales (Shadcn)
│   │   ├── charts/           # Gráficos circulares/barras
│   │   └── forms/            # Formularios de creación/edición
│   ├── lib/                  # Utilidades y configuración
│   │   ├── supabase/         # Cliente Supabase (browser/server)
│   │   └── utils.ts          # Funciones helpers (formateo de moneda, etc)
│   └── types/                # Definiciones de tipos TypeScript (TS)
├── tailwind.config.ts
├── middleware.ts             # Protección de rutas privadas (redirección si no hay sesión)
└── .env.local                # Variables de entorno (URL de Supabase y Anon Key)
```

## 6. INSTRUCCIONES DE EJECUCIÓN PARA EL AGENTE (PHASE-BY-PHASE)
1. **Fase 1: Inicialización.** Setup de Next.js, Tailwind, estructura de carpetas y dependencias.
2. **Fase 2: Conexión y Auth.** Cliente Supabase, middleware y pantallas de Auth.
3. **Fase 3: Layout y Navegación.** Layout del dashboard con Sidebar/Navbar.
4. **Fase 5: Módulo Calculadora ROI.** Formulario dinámico y guardado en DB.
5. **Fase 4: Módulo de Suscripciones.** CRUD de suscripciones.
6. **Fase 6: Dashboard y Gráficos.** Resumen con KPIs y gráficos.
