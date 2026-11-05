---
title: Sunward
summary: A mobile app that overlays the path of the sun on the live camera view.
order: 1
stack:
  - React Native
  - Expo
  - TypeScript
  - SunCalc
role: Designed and built the app.
result: A working prototype running on the device's own sensors, with no backend.
---

### Problem

Knowing where the sun is, and where it will go today, usually means reading numbers from a chart. Those numbers are hard to relate to the place you are standing.

### Solution

Sunward points the camera at your surroundings and draws the sun's path over the live view. It uses GPS to calculate the sun's position with SunCalc and the magnetometer to follow the direction the phone is facing. A panel shows sunrise, sunset, azimuth and altitude, refreshed every minute. The compass, the path and the panel can each be turned off.
