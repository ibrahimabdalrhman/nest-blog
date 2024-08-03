import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, from } from 'rxjs';
import { UserEntity } from './entities/user.entity';
import { Role, User } from './interface/user.interface';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';

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
    const userEntity = await this.userRepository.findOneBy({
      username: loginDto.username,
    });
    if (!userEntity) {
      throw new UnauthorizedException('Username or password is incorrect.');
    }
    const isPasswordValid = await this.authService.comparePasswords(
      loginDto.password,
      userEntity.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username or password is incorrect.');
    }

    // Convert UserEntity to User
    const user: User = {
      id: userEntity.id,
      name: userEntity.name,
      username: userEntity.username,
      email: userEntity.email,
      roles: userEntity.roles as Role, // Ensure conversion to Role type
    };

    return this.authService.generateJwt(user);
  }

  async findAll(): Promise<User[]> {
    const userEntities = await this.userRepository.find();

    // Convert UserEntity[] to User[]
    return userEntities.map((userEntity) => ({
      id: userEntity.id,
      name: userEntity.name,
      username: userEntity.username,
      email: userEntity.email,
      roles: userEntity.roles as Role, // Ensure conversion to Role type
    }));
  } 

  async paginate(options: IPaginationOptions): Promise<Pagination<UserEntity>> {
    return paginate<UserEntity>(this.userRepository, options);
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }
  updateOne(id: number, user: User) {
    return from(this.userRepository.update(id, user));
  }
}
