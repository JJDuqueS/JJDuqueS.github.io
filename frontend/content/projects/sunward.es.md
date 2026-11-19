---
title: Sunward
summary: Una app móvil que dibuja el recorrido del sol sobre la vista en vivo de la cámara.
order: 1
stack:
  - React Native
  - Expo
  - TypeScript
  - SunCalc
role: Diseñé y construí la app.
result: Un prototipo funcional que usa los propios sensores del teléfono, sin backend.
---

### Problema

Saber dónde está el sol, y hacia dónde irá hoy, normalmente significa leer números en una tabla. Esos números son difíciles de relacionar con el lugar donde estás parado.

### Solución

Sunward apunta la cámara a tu alrededor y dibuja el recorrido del sol sobre la vista en vivo. Usa el GPS para calcular la posición del sol con SunCalc y el magnetómetro para seguir hacia dónde apunta el teléfono. Un panel muestra el amanecer, el atardecer, el azimut y la altitud, actualizados cada minuto. La brújula, el recorrido y el panel se pueden desactivar por separado.
