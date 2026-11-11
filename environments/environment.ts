const GATEWAY = 'TU_API_URL';

export const environment = {
  production: false,
  API: {
    admin: GATEWAY + 'admin/',
    auth: GATEWAY + 'auth/',
    order: GATEWAY + 'order/',
    inventory: GATEWAY + 'inventory/'
  },
  API_GOOGLE_MAPS: ''
};
