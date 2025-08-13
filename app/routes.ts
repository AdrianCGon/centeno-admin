import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/solicitudes", "routes/solicitudes.tsx"),
  route("/solicitudes/:id", "routes/solicitud-detalle.tsx"),
  route("/libros", "routes/libros.tsx"),
  route("/libros/nuevo", "routes/libro-nuevo.tsx"),
  route("/libros/:id", "routes/libro-editar.tsx"),
  route("/comparar-excel", "routes/comparar-excel.tsx"), // Nueva ruta para comparar archivos Excel
  route("/comisiones", "routes/comisiones.tsx"), // Nueva ruta para gestionar comisiones
  route("*", "routes/404.tsx"), // Ruta catch-all para manejar rutas no encontradas
] satisfies RouteConfig;
