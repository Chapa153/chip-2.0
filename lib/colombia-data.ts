// Datos de departamentos y municipios de Colombia
export const departmentosData = {
  Amazonas: ["Leticia", "Puerto Nariño"],
  Antioquia: ["Medellín", "Envigado", "Bello", "Itagüí", "Rionegro", "Cali", "Manizales"],
  Arauca: ["Arauca", "Arauquita", "Cravo Norte"],
  Atlántico: ["Barranquilla", "Soledad", "Malambo", "Luruaco"],
  Bolívar: ["Cartagena", "Turbaco", "Magangué", "Montecristo"],
  Boyacá: ["Tunja", "Duitama", "Sogamoso", "Ipiales"],
  Caldas: ["Manizales", "Villamaría", "Neira", "Salamina"],
  Caquetá: ["Florencia", "San Vicente del Caguán", "Montañita"],
  Casanare: ["Yopal", "Aguazul", "Pore"],
  Cauca: ["Popayán", "Santander de Quilichao", "Silvia", "Totoró"],
  Cesar: ["Valledupar", "Bosconia", "La Paz"],
  Córdoba: ["Montería", "Cereté", "Chinú"],
  Cundinamarca: ["Bogotá", "Soacha", "Zipaquirá", "Facatativá", "Fusagasugá", "Girardot", "Ibagué"],
  Guainía: ["Inírida", "San Felipe"],
  Guaviare: ["San José del Guaviare", "El Retorno"],
  Huila: ["Neiva", "Pitalito", "La Plata"],
  "La Guajira": ["Riohacha", "Maicao", "Uribia"],
  Magdalena: ["Santa Marta", "Fundación", "Ciénaga"],
  Meta: ["Villavicencio", "Acacías", "San Juan de Arama"],
  Nariño: ["Pasto", "Ipiales", "Tumaco"],
  "Norte de Santander": ["Cúcuta", "Los Patios", "San Cristóbal"],
  Putumayo: ["Mocoa", "Puerto Caicedo"],
  Quindío: ["Armenia", "Pereira", "Manizales"],
  Risaralda: ["Pereira", "Dosquebradas", "Cartago"],
  Santander: ["Bucaramanga", "Floridablanca", "Piedecuesta", "Giron"],
  Sucre: ["Sincelejo", "Corozal", "Sampués"],
  Tolima: ["Ibagué", "Espinal", "Melgar"],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Yumbo"],
  Vaupés: ["Mitú"],
  Vichada: ["Puerto Carreño", "La Primavera"],
}

export const getDepartamentos = () => Object.keys(departmentosData).sort()

export const getMunicipios = (departamento: string) => {
  return departmentosData[departamento as keyof typeof departmentosData] || []
}
