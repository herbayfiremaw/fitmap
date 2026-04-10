import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Language } from '../../entities';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Ivan Ivanov', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'ivan@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'newpassword123', minLength: 6, required: false })
  @MinLength(6)
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ enum: Language, required: false })
  @IsEnum(Language)
  @IsOptional()
  preferred_language?: Language;
}
