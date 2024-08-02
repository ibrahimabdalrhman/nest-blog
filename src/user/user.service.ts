import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from } from 'rxjs';
import { UserEntity } from './entities/user.entity';
import { User } from './interface/user.interface';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { SignupDto } from 'src/auth/dto/signup.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly authService: AuthService,
  ) {}

  async create(user: SignupDto): Promise<User> {
    user.password = await this.authService.hashPassword(user.password);
    const existingUser = await this.userRepository.findOne({
      where: [{ username: user.username }, { email: user.email }],
    });
    if (existingUser) {
      throw new ConflictException('Username or email already exists.');
    }
    return this.userRepository.save(user);
  }

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.userRepository.findOneBy({
      username: loginDto.username,
    });
    if (!user) {
      throw new UnauthorizedException('Username or password is incorrect.');
    }
    const isPasswordValid = await this.authService.comparePasswords(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username or password is incorrect.');
    }
    return this.authService.generateJwt(user);
  }

  findAll(): Observable<User[]> {
    return from(this.userRepository.find());
  }
  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }
  updateOne(id: number, user: User) {
    return from(this.userRepository.update(id, user));
  }
}
