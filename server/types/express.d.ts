import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      email: string;
      username: string;
      role: string;
    };
  }
}

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      username: string;
      role: string;
      createdAt: Date;
    }
  }
}

export {};
