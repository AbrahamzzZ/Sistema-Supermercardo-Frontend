export const CLAVES_STORAGE = {
  token: 'token', // JWT de la sesión (localStorage)
  mensajeLogoutMostrado: 'logout-message-shown' // Evita repetir el mensaje de "sesión cerrada" en el login (sessionStorage)
} as const;
