import { User } from 'src/user/interface/user.interface';

export interface Blog {
  id?: number;
  title?: string;
  body?: string;
  createdAt?: Date;
  updatesAt?: Date;
  likes?: number;
  auther?: User;
  headerImage?: string;
}
