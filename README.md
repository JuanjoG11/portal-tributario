# Portal Tributario - Tienda y Marcas Del Eje Cafetero

Esta plataforma permite automatizar la descarga de certificados de retención (ReteFuente, ReteIVA, ReteICA) para clientes y proveedores.

## 🚀 Inicio Rápido

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo**:
   ```bash
   npm run dev
   ```

3. **Configurar Base de Datos**:
   - Crea un proyecto en [Supabase](https://supabase.com).
   - Ejecuta el contenido de `setup_database.sql` en el SQL Editor de Supabase.
   - Crea un archivo `.env` en la raíz con tus credenciales:
     ```env
     VITE_SUPABASE_URL=tu_url
     VITE_SUPABASE_ANON_KEY=tu_key
     ```

## 🛠️ Funcionalidades

- **Portal Público**: Búsqueda por NIT, Año y Tipo.
- **Generación de PDF**: Certificados profesionales generados al instante.
- **Panel Administrativo**: Carga masiva de datos desde archivos Excel (.xlsx).
- **Diseño Premium**: Interfaz moderna con Glassmorphism y animaciones fluidas.

## 📁 Estructura del Proyecto

- `src/App.jsx`: Lógica principal y navegación.
- `src/components/AdminPortal.jsx`: Lógica de carga de archivos Excel.
- `src/utils/pdfGenerator.js`: Plantilla y lógica de generación de PDF.
- `src/utils/supabaseClient.js`: Configuración de conexión.
- `setup_database.sql`: Script para crear las tablas necesarias.
