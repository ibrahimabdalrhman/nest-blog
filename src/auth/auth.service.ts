import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable, from, of } from 'rxjs';
import { User } from 'src/user/interface/user.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJwt(user: User): Promise<string> {
    return this.jwtService.signAsync({ user });
  }

  hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  comparePasswords(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
