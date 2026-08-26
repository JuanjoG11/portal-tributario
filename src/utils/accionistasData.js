// Base de datos de accionistas TYM
// TD: 31 = NIT (Persona Jurídica), 13 = Cédula (Persona Natural)
// % PART. y POSICION DECIMAL permiten calcular el porcentaje real:
//   porcentaje = POSICION DECIMAL === 1 ? `${% PART.}.${POSICION DECIMAL}` : `${% PART.}`
//   Ej: % PART. = 25, POSICION DECIMAL = 1  →  2.5%

export const ACCIONISTAS_TYM = [
  {
    td: 31,
    nit: '900093199',
    dv: '1',
    apellido1: '',
    apellido2: '',
    nombre1: '',
    otrosNombres: '',
    razonSocial: 'DISTRITIENDAS DE COLOMBIA S.A.',
    direccion: 'CR 32 A 10 220',
    dep: '76',
    municipio: '892',
    pais: '169',
    vrPatrimonial: 100000000,
    valorPrima: 0,
    pctPart: 20,
    posicionDecimal: 0,
    cuentaPorPagar: 70914621,
  },
  {
    td: 31,
    nit: '900906822',
    dv: '1',
    apellido1: '',
    apellido2: '',
    nombre1: '',
    otrosNombres: '',
    razonSocial: 'S10 S.A.S.',
    direccion: 'CL 42 NORTE 4 N 55 BRR VIPASA',
    dep: '76',
    municipio: '001',
    pais: '169',
    vrPatrimonial: 100000000,
    valorPrima: 0,
    pctPart: 20,
    posicionDecimal: 0,
    cuentaPorPagar: 70914621,
  },
  {
    td: 13,
    nit: '16597510',
    dv: '',
    apellido1: 'CARE',
    apellido2: 'BERTINI',
    nombre1: 'NELSON',
    otrosNombres: 'ROBERTO',
    razonSocial: '',
    direccion: 'CR 17 84 34 LA VILLA',
    dep: '66',
    municipio: '001',
    pais: '169',
    vrPatrimonial: 50000000,
    valorPrima: 0,
    pctPart: 10,
    posicionDecimal: 0,
    cuentaPorPagar: 35457311,
  },
  {
    td: 13,
    nit: '16638159',
    dv: '',
    apellido1: 'CARE',
    apellido2: 'BERTINI',
    nombre1: 'CARLOS',
    otrosNombres: 'ALBERTO',
    razonSocial: '',
    direccion: 'CR 17 84 34 LA VILLA',
    dep: '66',
    municipio: '001',
    pais: '169',
    vrPatrimonial: 50000000,
    valorPrima: 0,
    pctPart: 10,
    posicionDecimal: 0,
    cuentaPorPagar: 35457311,
  },
  {
    td: 13,
    nit: '66866189',
    dv: '',
    apellido1: 'JARAMILLO',
    apellido2: 'CARE',
    nombre1: 'MARCELA',
    otrosNombres: '',
    razonSocial: '',
    direccion: 'CR 17 84 34 LA VILLA',
    dep: '66',
    municipio: '001',
    pais: '169',
    vrPatrimonial: 50000000,
    valorPrima: 0,
    pctPart: 10,
    posicionDecimal: 0,
    cuentaPorPagar: 35457311,
  },
  {
    td: 13,
    nit: '1130638416',
    dv: '',
    apellido1: 'CARE',
    apellido2: 'ARANGO',
    nombre1: 'FRANCESCO',
    otrosNombres: '',
    razonSocial: '',
    direccion: 'CR 17 84 34 LA VILLA',
    dep: '66',
    municipio: '001',
    pais: '169',
    vrPatrimonial: 50000000,
    valorPrima: 0,
    pctPart: 10,
    posicionDecimal: 0,
    cuentaPorPagar: 35457311,
  },
  {
    td: 13,
    nit: '16463071',
    dv: '',
    apellido1: 'CARE',
    apellido2: 'TAMAYO',
    nombre1: 'JUAN',
    otrosNombres: 'DAVID',
    razonSocial: '',
    direccion: 'CR 17 84 34 LA VILLA',
    dep: '66',
    municipio: '001',
    pais: '169',
    vrPatrimonial: 50000000,
    valorPrima: 0,
    pctPart: 10,
    posicionDecimal: 0,
    cuentaPorPagar: 35457311,
  },
  {
    td: 13,
    nit: '1107074522',
    dv: '',
    apellido1: 'CARE',
    apellido2: 'VARGAS',
    nombre1: 'VALERIA',
    otrosNombres: '',
    razonSocial: '',
    direccion: 'CL 42 NORTE 4 N 55 BRR LA FLORA',
    dep: '76',
    municipio: '001',
    pais: '169',
    vrPatrimonial: 12500000,
    valorPrima: 0,
    pctPart: 2,
    posicionDecimal: 5,
    cuentaPorPagar: 8864328,
  },
  {
    td: 13,
    nit: '1151957969',
    dv: '',
    apellido1: 'CARE',
    apellido2: 'VARGAS',
    nombre1: 'ALEJANDRO',
    otrosNombres: '',
    razonSocial: '',
    direccion: 'CL 42 NORTE 4 N 55 BRR LA FLORA',
    dep: '76',
    municipio: '001',
    pais: '169',
    vrPatrimonial: 12500000,
    valorPrima: 0,
    pctPart: 2,
    posicionDecimal: 5,
    cuentaPorPagar: 8864328,
  },
  {
    td: 13,
    nit: '31161429',
    dv: '',
    apellido1: 'VARGAS',
    apellido2: 'HERMOSA',
    nombre1: 'MARIA',
    otrosNombres: 'DEL SOCORRO',
    razonSocial: '',
    direccion: 'CL 42 4 N 55 BRR LA FLORA',
    dep: '76',
    municipio: '001',
    pais: '169',
    vrPatrimonial: 25000000,
    valorPrima: 0,
    pctPart: 5,
    posicionDecimal: 0,
    cuentaPorPagar: 17728655,
  },
];

/**
 * Busca un accionista por su NIT/cédula (ignora puntos, espacios y guiones).
 * @param {string} query - Número ingresado por el usuario
 * @returns {object|null} - Registro del accionista o null si no se encuentra
 */
export const buscarAccionista = (query) => {
  const clean = String(query).replace(/[^0-9A-Za-z]/g, '');
  return ACCIONISTAS_TYM.find(a => a.nit === clean) || null;
};

/**
 * Devuelve el nombre completo o razón social del accionista.
 */
export const getNombreAccionista = (a) => {
  if (a.td === 31) return a.razonSocial;
  const partes = [a.nombre1, a.otrosNombres, a.apellido1, a.apellido2].filter(Boolean);
  return partes.join(' ');
};

/**
 * Devuelve el porcentaje de participación como string legible.
 * Ej: pctPart=2, posicionDecimal=5 → "2.5"
 *     pctPart=10, posicionDecimal=0 → "10"
 */
export const getPorcentaje = (a) => {
  if (a.posicionDecimal && a.posicionDecimal !== 0) {
    return `${a.pctPart}.${a.posicionDecimal}`;
  }
  return `${a.pctPart}`;
};
