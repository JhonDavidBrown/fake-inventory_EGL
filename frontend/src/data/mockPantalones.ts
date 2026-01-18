import { Pantalon } from "@/types/pantalones";

export const mockPantalones: Pantalon[] = [
  {
    id: 1,
    referencia: "PT-001",
    nombre: "Pantalón Clásico",
    talla: "36",
    imagen:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=600&fit=crop&crop=center",
    insumos: [
      { nombre: "Tela Denim", cantidad: 1.5, precio: 25000 },
      { nombre: "Hilo", cantidad: 2, precio: 3000 },
      { nombre: "Botones", cantidad: 5, precio: 2000 },
      { nombre: "Cremallera", cantidad: 1, precio: 8000 },
    ],
    manoDeObra: {
      nombre: "Confección Pantalón",
      precio: 35000,
    },
  },
  {
    id: 2,
    referencia: "PT-002",
    nombre: "Pantalón Deportivo",
    talla: "38",
    imagen:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop&crop=center",
    insumos: [
      { nombre: "Tela Deportiva", cantidad: 1.2, precio: 30000 },
      { nombre: "Hilo Elástico", cantidad: 1, precio: 5000 },
      { nombre: "Cordón", cantidad: 1, precio: 4000 },
    ],
    manoDeObra: {
      nombre: "Confección Deportiva",
      precio: 28000,
    },
  },
  {
    id: 3,
    referencia: "PT-003",
    nombre: "Pantalón Formal",
    talla: "34",
    imagen:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=600&fit=crop&crop=center",
    insumos: [
      { nombre: "Tela Gabardina", cantidad: 1.8, precio: 40000 },
      { nombre: "Hilo Premium", cantidad: 2, precio: 6000 },
      { nombre: "Botones Metálicos", cantidad: 4, precio: 5000 },
      { nombre: "Forro", cantidad: 0.5, precio: 12000 },
    ],
    manoDeObra: {
      nombre: "Confección Formal",
      precio: 45000,
    },
  },
  {
    id: 4,
    referencia: "PT-004",
    nombre: "Pantalón Cargo",
    talla: "40",
    imagen:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=600&fit=crop&crop=center",
    insumos: [
      { nombre: "Tela Canvas", cantidad: 2.0, precio: 35000 },
      { nombre: "Hilo Resistente", cantidad: 3, precio: 4000 },
      { nombre: "Velcro", cantidad: 4, precio: 8000 },
      { nombre: "Hebillas", cantidad: 2, precio: 6000 },
    ],
    manoDeObra: {
      nombre: "Confección Cargo",
      precio: 40000,
    },
  },
  {
    id: 5,
    referencia: "PT-005",
    nombre: "Pantalón Skinny",
    talla: "32",
    imagen:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=600&fit=crop&crop=center",
    insumos: [
      { nombre: "Tela Stretch", cantidad: 1.0, precio: 28000 },
      { nombre: "Hilo Elástico", cantidad: 1, precio: 5000 },
      { nombre: "Cremallera Invisible", cantidad: 1, precio: 12000 },
    ],
    manoDeObra: {
      nombre: "Confección Ajustada",
      precio: 32000,
    },
  },
  {
    id: 6,
    referencia: "PT-006",
    nombre: "Pantalón Wide Leg",
    talla: "38",
    imagen:
      "https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?w=400&h=600&fit=crop&crop=center",
    insumos: [
      { nombre: "Tela Fluida", cantidad: 2.5, precio: 32000 },
      { nombre: "Hilo", cantidad: 2, precio: 3000 },
      { nombre: "Botón Forrado", cantidad: 1, precio: 3000 },
    ],
    manoDeObra: {
      nombre: "Confección Wide",
      precio: 38000,
    },
  },
  {
    id: 7,
    referencia: "PT-007",
    nombre: "Pantalón Chino",
    talla: "36",
    imagen:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=600&fit=crop&crop=center",
    insumos: [
      { nombre: "Tela Algodón", cantidad: 1.4, precio: 22000 },
      { nombre: "Hilo", cantidad: 2, precio: 3000 },
      { nombre: "Botones", cantidad: 3, precio: 1500 },
    ],
    manoDeObra: {
      nombre: "Confección Chino",
      precio: 30000,
    },
  },
  {
    id: 8,
    referencia: "PT-008",
    nombre: "Pantalón Jogger",
    talla: "38",
    imagen:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop&crop=center",
    insumos: [
      { nombre: "Tela French Terry", cantidad: 1.3, precio: 28000 },
      { nombre: "Cordón Elástico", cantidad: 1, precio: 6000 },
      { nombre: "Puños Elásticos", cantidad: 2, precio: 4000 },
    ],
    manoDeObra: {
      nombre: "Confección Jogger",
      precio: 25000,
    },
  },
];
