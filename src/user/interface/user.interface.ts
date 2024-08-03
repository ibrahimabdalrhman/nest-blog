export interface User {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  roles?: Role;
  avatar?: string;
}

export enum Role {
  Admin = 'admin',
  User = 'user',
}
