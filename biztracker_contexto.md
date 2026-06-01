# Contexto del Proyecto: BizTracker (Calculadora de Rentabilidad)

## 📌 Resumen del Proyecto
BizTracker es una aplicación web SaaS orientada a pequeños comercios y emprendedores individuales. Su propuesta de valor es ofrecer una interfaz extremadamente limpia, intuitiva y directa para la gestión comercial, eliminando la complejidad de los ERP tradicionales.

## 🛠 Stack Tecnológico
- **Frontend:** Next.js 16.2.0, React 19, TailwindCSS.
- **Backend/Base de Datos:** Supabase (PostgreSQL, Autenticación).
- **Despliegue:** Vercel.

## 🚀 Estado Actual y Funcionalidades
1. **Calculadora de Rentabilidad (ROI):** Permite calcular costos de materiales, tiempo invertido, tarifa por hora y margen deseado para obtener un precio sugerido y ganancias.
2. **Control de Stock:** Gestión de inventario básico con alertas de bajo stock integradas en la creación de productos y ventas.
3. **Registro de Ventas y Presupuestos:** Permite crear órdenes de venta finales (que descuentan stock) o presupuestos.
4. **Gestión de Perfil:** Configuración de moneda, datos del negocio, logo y enlaces.

## 💰 Modelo de Negocio (Growth Hacking - Fase 1)
Recientemente se pivotó de un modelo de suscripción ($12/mes) a un modelo de embudo agresivo:
- **Plan Freemium (Gratis):** 
  - Límite de 20 productos en el catálogo.
  - Límite de 10 operaciones (ventas o presupuestos) al mes.
- **Licencia Fundador (Lifetime Deal):** 
  - Pago único de $49 USD. 
  - Limitado a los primeros 50 usuarios.
  - Acceso ilimitado de por vida.
  - *Flujo de pago:* Actualmente manual. Cuando el usuario alcanza un límite, se le muestra un popup que lo redirige a un chat de WhatsApp prearmado para gestionar el pago.

## ⚙️ Detalles Técnicos Recientes (Últimos Cambios)
- Se agregó el campo `is_founder` (BOOLEAN, por defecto FALSE) en la tabla `profiles` de Supabase.
- Se actualizaron los contextos de React (`profile-context.tsx`) y los tipos (`app-types.ts`) para leer la variable `is_founder`.
- Se implementaron bloqueos en el Frontend:
  - En `roi-form.tsx`: bloquea la creación si `productos >= 20` y `!is_founder`.
  - En `sales-log-form.tsx`: bloquea el registro si `ventas_del_mes >= 10` y `!is_founder`.
- Se corrigió un error de sintaxis en `roi-form.tsx` que impedía el build en Vercel. **El despliegue en Vercel está actualmente funcional y en verde.**

## 🛑 Tareas Pendientes / Siguientes Pasos
1. **Validación Comercial:** Comenzar el "outreach" (Instagram, TikTok, Facebook) enviando el enlace a comercios locales para conseguir los primeros usuarios y validar la Licencia Fundador de $49.
2. **Activación de Fundadores:** Cuando un usuario pague por WhatsApp, el administrador debe entrar manualmente al Dashboard de Supabase (Tabla `profiles`) y cambiar el campo `is_founder` a `TRUE` para ese usuario específico.
3. **Mantenimiento Base de Datos:** Asegurarse de que el script SQL (`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_founder BOOLEAN DEFAULT false;`) se haya ejecutado correctamente en el entorno de Producción en Supabase.

---
*Nota generada para retomar el contexto en cualquier momento o desde otra PC.*
