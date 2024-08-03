export interface User {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  roles?:Role
}

export enum Role {
  Admin = 'admin',
  User = 'user',
}
