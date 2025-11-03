export interface ITokenData {
  nameid: number; // id del usuario
  postal_code: string; // codigo
  unique_name: string; // nombre completo
  email: string; // correo
  role: string; // rol
  exp: number; // tiempo de expiración
  iss: string; // issuer
  aud: string; // audience
}
