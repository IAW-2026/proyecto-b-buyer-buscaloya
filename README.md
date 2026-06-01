[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/7Ga9TYp-)
# buyer

Aplicación **Buyer** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `BuscaloYa`.

Esta app corresponde al rol del **Buyer** en los proyectos de tipo **B (Delivery)**.

---
# Buscaloya

Buscaloya es una plataforma web de delivery y e-commerce que conecta a los usuarios con las mejores tiendas de su ciudad. La aplicación permite explorar comercios, gestionar un carrito de compras en tiempo real, interactuar con mapas para localizar direcciones exactas y realizar un seguimiento preciso del ciclo de vida de los pedidos.

## Demo / Deploy

El proyecto se encuentra desplegado y listo para probar en el siguiente enlace:
🔗 **[Link al Deploy del Proyecto](https://proyecto-b-buyer-buscaloya.vercel.app)**

---

## Credenciales de Acceso

Para facilitar la corrección y evaluación de las diferentes funcionalidades según el rol del usuario, se pueden utilizar los siguientes accesos:

### 1. Usuario Final (Cliente)
*Este usuario permite buscar tiendas, cargar productos al carrito, gestionar direcciones personales y simular una compra.*
* **Usuario:** `buyer1@buscaloya.com`
* **Contraseña:** `Prueba1234`

*Este usuario contiene una compra ya realizada con un paquete por cada estado posible para visualizar cada uno.*
* **Usuario:** `buyer2@buscaloya.com`
* **Contraseña:** `Prueba1234`

### 2. Administrador de la Plataforma
*Este usuario habilita el acceso exclusivo al Panel Admin (`/admin/users`) para la gestión integral de usuarios, pudiendo editar datos del usuario seleccionado y sus direcciones.*
* **Usuario:** `admin@iaw.com`
* **Contraseña:** `admin_IAW_2026`

---

## Características Principales

* **Autenticación Segura:** Control de accesos y flujos de usuarios integrado con Clerk.
* **Navegación Dinámica por Roles:** Layout inteligente que adapta los menús (`Tiendas`, `Mi Compra`, `Mi Perfil` o `Panel Admin`) según el tipo de usuario logueado.
* **Gestión de Direcciones Interactiva:** Integración con Mapbox y `next/dynamic` para la selección y autocompletado de ubicaciones mediante mapas en tiempo real sin afectar el rendimiento del servidor.
* **Ciclo de Vida y Tracking de Pedidos:** Seguimiento de todos los paquetes de la compra. Además, cuando el pedido pasa al estado `OUT_FOR_DELIVERY` (En camino), se integra un mapa interactivo utilizando **MapLibre GL** que permite al usuario visualizar en tiempo real la localización de la tienda, su domicilio y el recorrido del repartidor.
* **Consumo de API Externa (Clima en Tiempo Real):** Integración mediante `fetch` nativo con el servicio de *WeatherAPI.com* desde el servidor. El sistema procesa la respuesta JSON del clima actual de la ciudad y modifica dinámicamente la interfaz de usuario en `/stores`, alertando a los clientes sobre posibles demoras en la logística de envíos si se detectan condiciones climáticas adversas (como lluvia o tormentas). Para demostrar que funciona siempre se incluyó el aviso también en caso de buen clima.
* **Conectividad con Webapps del Proyecto (Arquitectura Híbrida):** Se desarrolló el consumo e integración de datos con las APIs externas de las otras aplicaciones del equipo. Para garantizar la estabilidad de la aplicación durante la evaluación independientemente de la disponibilidad de servidores externos, se implementó una arquitectura basada en variables de entorno: configurando `USE_MOCKS="true"`, el sistema conmuta automáticamente hacia respuestas *mockeadas* que emulan con total precisión los contratos de los endpoints reales.
También para esta etapa implementó una interfaz dedicada para simular el comportamiento de una plataforma de pagos externa. El usuario es redirigido a una página donde puede forzar la **aprobación** o la **cancelación** del pago, garantizando el testeo completo de los flujos alternativos del sistema.  
---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>
