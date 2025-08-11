import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/solicitudes", "routes/solicitudes.tsx"),
  route("/solicitudes/:id", "routes/solicitud-detalle.tsx"),
  route("/libros", "routes/libros.tsx"),
  route("/libros/nuevo", "routes/libro-nuevo.tsx"),
  route("/libros/:id", "routes/libro-editar.tsx"),
] satisfies RouteConfig;
