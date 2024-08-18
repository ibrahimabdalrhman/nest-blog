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
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { createReadStream } from 'fs';
import { Response } from 'express';
import { UserIsUserGuard } from 'src/auth/guard/userIsUser.guard';

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
  deleteOne(@Param('id') id: number) {
    return this.userService.deleteOne(id);
  }
  @UseGuards(JwtAuthGuard, UserIsUserGuard)
  @Patch(':id')
  updateOne(@Param('id') id: number, @Body() user: User) {
    return this.userService.updateOne(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './avatars',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fullAvatarUrl = `${baseUrl}/user/avatar/${file.filename}`;
    return this.userService.updateAvatar(fullAvatarUrl, req.user.user.id);
  }

  @Get('avatar/:avatar')
  getFile(@Param('avatar') avatar: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'avatars', avatar);
    const file = createReadStream(filePath);

    file.on('error', (err) => {
      console.error(err);
      res.status(404).send('File not found');
    });

    res.setHeader('Content-Type', 'image/jpeg'); // Set appropriate content type based on your files
    file.pipe(res);
  }
}
