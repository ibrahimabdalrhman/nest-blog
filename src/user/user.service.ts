import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Observable, from } from 'rxjs';
import { UserEntity } from './entities/user.entity';
import { Role, User } from './interface/user.interface';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { SignupDto } from 'src/auth/dto/signup.dto';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';

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

  async findUserById(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id });
  }

  async filterByUsername(
    options: IPaginationOptions,
    user: User,
  ): Promise<Pagination<UserEntity>> {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;

    const [results, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
      select: ['id', 'name', 'username', 'email', 'roles'],
      where: user.username ? { username: Like(`%${user.username}%`) } : {},
    });

    return {
      items: results,
      meta: {
        totalItems: total,
        itemCount: results.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }
  updateOne(id: number, user: User) {
    return from(this.userRepository.update(id, user));
  }

  async updateAvatar(path: string, id: number) {
    const user = await this.userRepository.findOneBy({ id });
    user.avatar = path;
    return await this.userRepository.save(user);
  }
}
