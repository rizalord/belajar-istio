declare namespace Express {
  export interface Request {
    user: User;
  }

  interface User {
    name: string;
    username: string;
    password?: string;
  }
}
