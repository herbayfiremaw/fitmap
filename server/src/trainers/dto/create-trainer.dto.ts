import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTrainerDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  venue_id: string;

  @ApiProperty({ example: 'Георги Петров' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Треньор по бокс с 10 години опит' })
  @IsString()
  @IsOptional()
  bio_bg?: string;

  @ApiPropertyOptional({ example: 'Boxing coach with 10 years of experience' })
  @IsString()
  @IsOptional()
  bio_en?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  @IsString()
  @IsOptional()
  photo_url?: string;

  @ApiPropertyOptional({ example: ['Boxing', 'Kickboxing'] })
  @IsArray()
  @IsOptional()
  specialties?: string[];
}
