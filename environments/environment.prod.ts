export type Arquitectura = 'monolito' | 'microservicios';

const GATEWAY = 'TU_API_URL_PRODUCCION';

export const environment = {
  production: true,
  ARQUITECTURA: 'microservicios' as Arquitectura,
  API: {
    admin: GATEWAY + 'admin/',
    auth: GATEWAY + 'auth/',
    order: GATEWAY + 'order/',
    inventory: GATEWAY + 'inventory/'
  },
  API_GOOGLE_MAPS: 'TU_API_KEY_PRODUCCION'
};
