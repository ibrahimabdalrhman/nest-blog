import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Role, User } from './interface/user.interface';
import { LoginDto } from 'src/auth/dto/login.dto';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { UserEntity } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post('signup')
  create(@Body() user: SignupDto) {
    return this.userService.create(user);
  }
  @Post('login')
  login(@Body() login: LoginDto) {
    return this.userService.login(login);
  }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll() {
    return this.userService.findAll();
  }
  @Get('all')
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('username') username?: string,
  ): Promise<Pagination<UserEntity>> {
    const options: IPaginationOptions = {
      page,
      limit,
    };
    const filterUser = { username: username || '' }; 
    return this.userService.filterByUsername(options, filterUser);
  }
  @Delete(':id')
  deleteOne(@Param() id: number) {
    return this.userService.deleteOne(id);
  }
  @Patch(':id')
  updateOne(@Param() id: number, @Body() user: User) {
    return this.userService.updateOne(id, user);
  }
}
