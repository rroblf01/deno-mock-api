import { serve } from "./deps.ts";
import {
  createElementRoute,
  getAllRoute,
  getElementBySlugRoute,
  homeRoute,
  infoRoute,
  mockRoute,
} from "./routes.ts";

serve({
  "/createElement": createElementRoute,
  "/getAll": getAllRoute,
  "/info": infoRoute,
  "/mock": mockRoute,
  "/:slug": getElementBySlugRoute,
  "/": homeRoute,
});
