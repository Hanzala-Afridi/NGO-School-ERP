declare global {
  namespace Express {
    interface Request {
      id: string
      auth?: import('./modules/auth/domain/auth-context.js').AuthContext
    }
  }
}

export {}
