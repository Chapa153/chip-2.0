export interface NodoClasificador {
  codigo: string
  nombre: string
  hijos?: NodoClasificador[]
}

export interface Clasificador {
  nombre: string
  arbol: NodoClasificador[]
}

export const clasificadores: Clasificador[] = [
  {
    nombre: "CGN CONVERGENCIA",
    arbol: [
      { codigo: "1", nombre: "BANCO CENTRAL" },
      { codigo: "2", nombre: "SISTEMA GENERAL DE REGALIAS" },
      {
        codigo: "3",
        nombre: "NACIONAL ADMINISTRACIÓN",
        hijos: [
          {
            codigo: "3.1",
            nombre: "NACIONAL GOBIERNO GENERAL",
            hijos: [
              {
                codigo: "3.1.1",
                nombre: "NACIONAL ADMINISTRACION CENTRAL",
                hijos: [
                  { codigo: "3.1.1.1", nombre: "NACIONAL PRESIDENCIA DE LA REPÚBLICA" },
                  { codigo: "3.1.1.2", nombre: "NACIONAL MINISTERIOS" },
                  { codigo: "3.1.1.3", nombre: "NACIONAL DEPARTAMENTOS ADMINISTR" },
                  { codigo: "3.1.1.4", nombre: "NACIONAL SUPERINTENDENCIAS SIN PJ" },
                  { codigo: "3.1.1.5", nombre: "NACIONAL U.A.E SIN PERSONERIA JURÍDICA" },
                  { codigo: "3.1.1.6", nombre: "NACIONAL RAMA LEGISLATIVA" },
                  { codigo: "3.1.1.7", nombre: "NACIONAL RAMA JUDICIAL" },
                  { codigo: "3.1.1.8", nombre: "NACIONAL ORGANISMOS DE CONTROL" },
                  { codigo: "3.1.1.9", nombre: "NACIONAL ORGANIZACION ELECTORAL" },
                  { codigo: "3.1.1.10", nombre: "NACIONAL OTRAS ENTIDADES ADMINIST." },
                ],
              },
              {
                codigo: "3.1.2",
                nombre: "NACIONAL ADMINISTRACION DESCENTRALIZADA",
                hijos: [
                  { codigo: "3.1.2.1", nombre: "NACIONAL ESTABLECIMIENTOS PUBLICOS" },
                  { codigo: "3.1.2.2", nombre: "NACIONAL INSTITUTOS CIENTÍFICOS O TECNOLÓGICOS" },
                  { codigo: "3.1.2.3", nombre: "NACIONAL SUPERINTENDENCIAS CON PJ" },
                  { codigo: "3.1.2.4", nombre: "NACIONAL U.A.E CON PERSONERIA JURÍDICA" },
                ],
              },
              {
                codigo: "3.1.3",
                nombre: "NACIONAL OTRAS ENTIDADES GOBIERNO",
              },
            ],
          },
          {
            codigo: "3.2",
            nombre: "NACIONAL EMPRESAS QUE COTIZAN",
            hijos: [
              { codigo: "3.2.1", nombre: "NACIONAL COTIZANTES E.I.C.E" },
              { codigo: "3.2.2", nombre: "NACIONAL COTIZANTES SOCIEDADES PÚBLICAS" },
            ],
          },
        ],
      },
    ],
  },
  {
    nombre: "EFCMM - Medellín Control",
    arbol: [
      { codigo: "1", nombre: "CONTROL FISCAL PREVENTIVO" },
      { codigo: "2", nombre: "CONTROL FISCAL POSTERIOR" },
      {
        codigo: "3",
        nombre: "ENTIDADES VIGILADAS",
        hijos: [
          { codigo: "3.1", nombre: "SECTOR CENTRAL" },
          { codigo: "3.2", nombre: "SECTOR DESCENTRALIZADO" },
        ],
      },
    ],
  },
  {
    nombre: "Entidades no consolidables CGN",
    arbol: [
      { codigo: "1", nombre: "PATRIMONIOS AUTÓNOMOS" },
      { codigo: "2", nombre: "FONDOS ESPECIALES" },
      { codigo: "3", nombre: "OTRAS ENTIDADES NO CONSOLIDABLES" },
    ],
  },
  {
    nombre: "Clasif Gastos Funciones Gobierno",
    arbol: [
      { codigo: "1", nombre: "SERVICIOS PÚBLICOS GENERALES" },
      { codigo: "2", nombre: "DEFENSA" },
      { codigo: "3", nombre: "ORDEN PÚBLICO Y SEGURIDAD" },
      { codigo: "4", nombre: "ASUNTOS ECONÓMICOS" },
      { codigo: "5", nombre: "PROTECCIÓN DEL MEDIO AMBIENTE" },
    ],
  },
  {
    nombre: "CGN Presupuesto General",
    arbol: [
      { codigo: "1", nombre: "INGRESOS CORRIENTES" },
      { codigo: "2", nombre: "INGRESOS DE CAPITAL" },
      {
        codigo: "3",
        nombre: "GASTOS DE FUNCIONAMIENTO",
        hijos: [
          { codigo: "3.1", nombre: "SERVICIOS PERSONALES" },
          { codigo: "3.2", nombre: "GASTOS GENERALES" },
          { codigo: "3.3", nombre: "TRANSFERENCIAS" },
        ],
      },
    ],
  },
  {
    nombre: "CGN SIIN",
    arbol: [
      { codigo: "1", nombre: "ACTIVOS" },
      { codigo: "2", nombre: "PASIVOS" },
      { codigo: "3", nombre: "PATRIMONIO" },
      { codigo: "4", nombre: "INGRESOS" },
      { codigo: "5", nombre: "GASTOS" },
    ],
  },
  {
    nombre: "CGN POR MODELOS",
    arbol: [
      { codigo: "1", nombre: "EMPRESAS COTIZANTES" },
      { codigo: "2", nombre: "EMPRESAS NO COTIZANTES" },
      { codigo: "3", nombre: "ENTIDADES DE GOBIERNO" },
    ],
  },
  {
    nombre: "CGN POR DEPARTAMENTO",
    arbol: [
      { codigo: "1", nombre: "AMAZONAS" },
      { codigo: "2", nombre: "ANTIOQUIA" },
      { codigo: "3", nombre: "ARAUCA" },
      { codigo: "4", nombre: "ATLÁNTICO" },
      { codigo: "5", nombre: "BOLÍVAR" },
      { codigo: "6", nombre: "BOYACÁ" },
      { codigo: "7", nombre: "CALDAS" },
      { codigo: "8", nombre: "CAQUETÁ" },
      { codigo: "9", nombre: "CASANARE" },
      { codigo: "10", nombre: "CAUCA" },
    ],
  },
  {
    nombre: "CGN MEFP 2014",
    arbol: [
      { codigo: "1", nombre: "GOBIERNO GENERAL" },
      { codigo: "2", nombre: "SOCIEDADES PÚBLICAS NO FINANCIERAS" },
      { codigo: "3", nombre: "SOCIEDADES PÚBLICAS FINANCIERAS" },
    ],
  },
  {
    nombre: "EFCMM_MarcoNormativo",
    arbol: [
      { codigo: "1", nombre: "DECRETO 403 DE 2020" },
      { codigo: "2", nombre: "RESOLUCIÓN 001 DE 2021" },
      { codigo: "3", nombre: "OTROS MARCOS NORMATIVOS" },
    ],
  },
  {
    nombre: "EFCMM Control GESMM",
    arbol: [
      { codigo: "1", nombre: "CONTROL PREVIO" },
      { codigo: "2", nombre: "CONTROL CONCURRENTE" },
      { codigo: "3", nombre: "CONTROL POSTERIOR" },
    ],
  },
  {
    nombre: "EFCMM Ppto Inversión GESMM",
    arbol: [
      { codigo: "1", nombre: "INVERSIÓN SOCIAL" },
      { codigo: "2", nombre: "INVERSIÓN EN INFRAESTRUCTURA" },
      { codigo: "3", nombre: "INVERSIÓN EN TECNOLOGÍA" },
    ],
  },
  {
    nombre: "EFCMM Naturaleza Jurídica GESMM",
    arbol: [
      { codigo: "1", nombre: "ENTIDADES PÚBLICAS" },
      { codigo: "2", nombre: "EMPRESAS INDUSTRIALES Y COMERCIALES" },
      { codigo: "3", nombre: "SOCIEDADES DE ECONOMÍA MIXTA" },
    ],
  },
  {
    nombre: "GRUPO DE CLASIFICACIÓN DEL SEI",
    arbol: [
      { codigo: "1", nombre: "GRUPO A - ALTO IMPACTO" },
      { codigo: "2", nombre: "GRUPO B - MEDIANO IMPACTO" },
      { codigo: "3", nombre: "GRUPO C - BAJO IMPACTO" },
    ],
  },
  {
    nombre: "EFCMM - Medellín CIIU",
    arbol: [
      { codigo: "1", nombre: "AGRICULTURA, GANADERÍA, CAZA" },
      { codigo: "2", nombre: "PESCA Y ACUICULTURA" },
      { codigo: "3", nombre: "EXPLOTACIÓN DE MINAS Y CANTERAS" },
      { codigo: "4", nombre: "INDUSTRIAS MANUFACTURERAS" },
    ],
  },
  {
    nombre: "EFCMM - Medellín FMI",
    arbol: [
      { codigo: "1", nombre: "GOBIERNO CENTRAL" },
      { codigo: "2", nombre: "GOBIERNOS LOCALES" },
      { codigo: "3", nombre: "FONDOS DE SEGURIDAD SOCIAL" },
    ],
  },
  {
    nombre: "EFCMM - Medellín PP inversión",
    arbol: [
      { codigo: "1", nombre: "PROYECTOS DE INFRAESTRUCTURA" },
      { codigo: "2", nombre: "PROYECTOS SOCIALES" },
      { codigo: "3", nombre: "PROYECTOS AMBIENTALES" },
    ],
  },
  {
    nombre: "EFCMM - Medellín Estructura",
    arbol: [
      { codigo: "1", nombre: "ALCALDÍA" },
      { codigo: "2", nombre: "SECRETARÍAS" },
      {
        codigo: "3",
        nombre: "ENTIDADES DESCENTRALIZADAS",
        hijos: [
          { codigo: "3.1", nombre: "EMPRESAS PÚBLICAS" },
          { codigo: "3.2", nombre: "INSTITUTOS" },
        ],
      },
    ],
  },
]

export function getClasificador(nombre: string): Clasificador | undefined {
  return clasificadores.find((c) => c.nombre === nombre)
}

export function getNombresClasificadores(): string[] {
  return clasificadores.map((c) => c.nombre)
}
