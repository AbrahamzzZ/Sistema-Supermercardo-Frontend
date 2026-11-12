export type Arquitectura = 'monolito' | 'microservicios';

const API = 'TU_API_URL';

export const environment = {
  production: false,
  ARQUITECTURA: 'monolito' as Arquitectura,
  API: {
    admin: API,
    auth: API,
    order: API,
    inventory: API
  },
  API_GOOGLE_MAPS: ''
};
