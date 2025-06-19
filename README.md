# Agenda Médica

Agenda Médica es un sistema de gestión de citas médicas desarrollado en Angular y Firebase. Permite a pacientes agendar citas, a doctores gestionar su agenda y a administradores configurar días bloqueados y gestionar usuarios.

## Características

- Autenticación de usuarios (pacientes, doctores, administradores)
- Registro de pacientes y doctores
- Agendado y gestión de citas médicas
- Asignación automática de doctores y control de disponibilidad
- Seguimiento de tratamientos y expedientes médicos
- Notificaciones por correo electrónico (EmailJS)
- Panel de administración para bloquear días (ej. feriados)
- Control de acceso por roles

## Tecnologías

- **Frontend:** Angular 16+, PrimeNG, SweetAlert2
- **Backend:** Firebase Firestore, Firebase Auth, EmailJS

## Requisitos previos

- Tener instalado **Node.js** (versión 16 o superior).  
  Puedes descargarlo desde: [https://nodejs.org/es/](https://nodejs.org/es/)
- Tener instalado **Angular CLI**  
  Instálalo ejecutando en la terminal:
  ```bash
  npm install -g @angular/cli
  ```
- Tener una cuenta y proyecto en **Firebase** (con Firestore y Auth habilitados)
- Tener una cuenta en **EmailJS** (para notificaciones por correo)

## Instalación

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/agenda-medica.git
   cd agenda-medica
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   ```

3. **Configura Firebase:**
   - Copia tu configuración de Firebase en los archivos `src/environments/environment.development.ts` y `src/environments/environment.ts`.
   - Crea las colecciones necesarias en Firestore: `users`, `appointments`, `treatments`, `freeDays`, `specialties`, `appointmentType`, etc.

4. **Configura EmailJS:**
   - Agrega tus claves de EmailJS en los archivos de entorno bajo la propiedad `emailjs`.

## Cómo ejecutar el proyecto

1. **Inicia el servidor de desarrollo:**
   ```bash
   npm run start
   ```
   o también puedes usar:
   ```bash
   ng serve
   ```

2. **Abre tu navegador y visita:**  
   [http://localhost:4200](http://localhost:4200)

## Estructura del proyecto

- `src/app/auth` - Autenticación y registro
- `src/app/user` - Gestión de usuarios (pacientes, doctores)
- `src/app/appointment` - Funcionalidades de citas
- `src/app/treatments` - Gestión de tratamientos
- `src/app/medical-record` - Expedientes médicos
- `src/app/admin-panel` - Panel de administración (configuración de días)
- `src/app/shared/services` - Servicios reutilizables de Angular

## Colecciones de Firestore

- `users` - Perfiles de usuarios (pacientes, doctores, admins)
- `appointments` - Documentos de citas
- `treatments` - Registros de tratamientos
- `freeDays` - Días bloqueados (admin)
- `specialties` - Especialidades médicas
- `appointmentType` - Tipos de consulta

## Scripts útiles

- `npm run start` o `ng serve` - Inicia el servidor de desarrollo
- `ng build` - Compila el proyecto para producción
- `ng test` - Ejecuta los tests unitarios

## Contribuciones

¡Se aceptan pull requests! Para cambios importantes, por favor abre primero un issue para discutir lo que te gustaría modificar.

## Licencia

MIT

---

**Nota:**  
- Recuerda actualizar las variables de entorno y las reglas de Firebase para producción.
- Para cualquier duda o problema, contacta al responsable del proyecto o abre un issue en GitHub.
