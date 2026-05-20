# Plan de Mantenimiento Semanal

## Cada semana

- [ ] Revisar `Vercel` y confirmar que el ultimo deploy este `Ready`
- [ ] Abrir `Deployments` y ver si hubo errores recientes en `Build Logs`
- [ ] Abrir `Logs` y revisar si hubo errores en `Functions`
- [ ] Probar el flujo basico de la app
- [ ] Registrar un producto nuevo
- [ ] Registrar una venta
- [ ] Crear un presupuesto
- [ ] Convertir un presupuesto en venta
- [ ] Confirmar que el stock baje correctamente
- [ ] Revisar en `Supabase` que se esten guardando datos en:
  - `products_roi`
  - `subscriptions`
  - `sales_orders`
  - `sales_order_items`
  - `stock_movements`
- [ ] Probar login y logout
- [ ] Confirmar que el callback de auth siga funcionando
- [ ] Revisar que los correos de confirmacion sigan llegando
- [ ] Abrir la app en incognito y verificar que no haya errores visibles
- [ ] Revisar consola del navegador si algo se ve raro
- [ ] Anotar cualquier error nuevo con fecha y mensaje exacto
- [ ] Guardar en GitHub cualquier cambio importante hecho esa semana
- [ ] Confirmar que nombre de empresa, logo y moneda sigan correctos
- [ ] Revisar si hay productos duplicados o viejos
- [ ] Revisar si hay gastos fijos mal cargados

## Cada mes

- [ ] Revisar si el uso real justifica pasar a un plan pago
- [ ] Verificar si el storage o la base estan quedando cortos
- [ ] Confirmar que la app siga rapida en celular
- [ ] Revisar que no haya datos inconsistentes en ventas o stock

## Regla simple

- [ ] Si algo falla dos semanas seguidas, corregirlo ese mismo dia
