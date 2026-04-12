import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Venue, Review } from '../entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Venue, Review]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'fitmap_jwt_dev_secret'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController, AdminController],
  providers: [AuthService, AdminService, JwtStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}
