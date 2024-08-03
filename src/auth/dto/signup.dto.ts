import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/user/interface/user.interface';

export class SignupDto {
  @IsString()
  username: string;
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsOptional()
  @IsEnum(Role)
   roles: Role;
}
