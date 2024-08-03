import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/user/interface/user.interface';

export const Roles = (...args: Role[]) => SetMetadata('roles', args);
