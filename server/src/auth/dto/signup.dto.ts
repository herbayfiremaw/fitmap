import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Language } from '../../entities';

export class SignupDto {
  @ApiProperty({ example: 'Ivan Ivanov' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'mypassword123', minLength: 6 })
  @MinLength(6)
  @IsString()
  password: string;

  @ApiProperty({ enum: Language, default: Language.BG, required: false })
  @IsEnum(Language)
  @IsOptional()
  preferred_language?: Language;
}
