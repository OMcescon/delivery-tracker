# Guía para Acceder a Delivery Tracker desde iPhone

Esta guía te mostrará paso a paso cómo acceder y utilizar la aplicación Delivery Tracker desde tu iPhone, permitiéndote tener un acceso rápido y cómodo desde tu dispositivo móvil.

## Requisitos Previos

- Un iPhone con iOS 13 o superior
- Navegador Safari (el navegador predeterminado de iPhone)
- Estar conectado a la misma red WiFi que la computadora donde se ejecuta la aplicación
- La aplicación Delivery Tracker debe estar en ejecución en la computadora

## Paso 1: Iniciar la Aplicación en la Computadora

1. En tu computadora, abre el archivo `iniciar-delivery-tracker.bat` haciendo doble clic sobre él.
2. Espera a que la aplicación inicie completamente. Verás que se abre una ventana de comandos y luego el navegador con la aplicación.
3. **Importante**: Deja esta ventana abierta mientras usas la aplicación desde tu iPhone.

## Paso 2: Conectar tu iPhone a la Misma Red WiFi

1. En tu iPhone, ve a **Configuración** > **WiFi**.
2. Asegúrate de estar conectado a la misma red WiFi que tu computadora.
3. Si no estás seguro de qué red está usando tu computadora, puedes verificarlo pasando el cursor sobre el icono de WiFi en la barra de tareas de Windows.

## Paso 3: Acceder a la Aplicación desde Safari

1. Abre el navegador **Safari** en tu iPhone.
2. En la barra de direcciones, ingresa la dirección IP de tu computadora seguida del puerto donde se está ejecutando la aplicación.
   - La dirección completa tendrá este formato: `http://192.168.1.XXX:3001`
   - Donde `192.168.1.XXX` es la dirección IP de tu computadora y `3001` es el puerto (puede variar).
3. Para encontrar la dirección IP y puerto correctos, mira la ventana de comandos en tu computadora donde iniciaste la aplicación. Busca una línea que diga:
   ```
   > Access from mobile device: http://192.168.1.XXX:3001
   ```
4. Ingresa exactamente esa dirección en Safari.

## Paso 4: Añadir la Aplicación a la Pantalla de Inicio

Para tener un acceso más rápido y una experiencia similar a una aplicación nativa:

1. Una vez que la aplicación esté cargada en Safari, toca el icono de **Compartir** (el cuadrado con una flecha hacia arriba) en la parte inferior de la pantalla.
2. Desplázate hacia abajo en el menú que aparece y toca **Añadir a Pantalla de Inicio**.
3. Personaliza el nombre si lo deseas (por defecto será "Delivery Tracker").
4. Toca **Añadir** en la esquina superior derecha.

Ahora tendrás un icono de Delivery Tracker en tu pantalla de inicio que abrirá la aplicación directamente cuando lo toques.

## Paso 5: Usar la Aplicación

1. Toca el icono de Delivery Tracker en tu pantalla de inicio para abrir la aplicación.
2. La aplicación se abrirá en modo de pantalla completa, similar a una aplicación nativa.
3. Puedes utilizar todas las funciones disponibles en la versión de escritorio:
   - Registrar nuevas entregas
   - Ver el historial de entregas
   - Filtrar por fechas
   - Exportar datos

## Consideraciones Importantes

- **La aplicación solo funcionará cuando:**
  - Tu computadora esté encendida
  - La aplicación Delivery Tracker esté en ejecución en la computadora
  - Tu iPhone esté conectado a la misma red WiFi que la computadora

- **Si cambias de red WiFi** (por ejemplo, si sales de casa), no podrás acceder a la aplicación hasta que vuelvas a conectarte a la misma red que tu computadora.

- **Si cierras la aplicación en la computadora**, necesitarás volver a iniciarla para poder acceder desde tu iPhone.

- **Si la dirección IP de tu computadora cambia** (lo cual puede ocurrir ocasionalmente en algunas redes), necesitarás actualizar el acceso directo en tu iPhone con la nueva dirección.

## Solución de Problemas

### No puedo acceder a la aplicación desde mi iPhone

1. Verifica que tu iPhone y computadora estén conectados a la misma red WiFi.
2. Asegúrate de que la aplicación esté en ejecución en la computadora.
3. Comprueba que estás usando la dirección IP y puerto correctos.
4. Intenta reiniciar la aplicación en la computadora ejecutando nuevamente el archivo `iniciar-delivery-tracker.bat`.

### La aplicación se ve diferente en mi iPhone

La aplicación está diseñada para adaptarse a diferentes tamaños de pantalla. Aunque la disposición puede variar ligeramente, todas las funcionalidades están disponibles en la versión móvil.

### La aplicación se cierra o muestra errores

Si experimentas problemas con la aplicación en tu iPhone:

1. Cierra Safari completamente (desliza hacia arriba desde la parte inferior de la pantalla y arrastra la vista previa de Safari hacia arriba).
2. Reinicia la aplicación en la computadora.
3. Vuelve a acceder desde tu iPhone usando la dirección correcta.

---

Si necesitas ayuda adicional, contacta al administrador del sistema o al desarrollador de la aplicación.