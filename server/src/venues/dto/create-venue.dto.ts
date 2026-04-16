import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsEmail,
} from 'class-validator';

export class CreateVenueDto {
  @ApiProperty({ example: 'FitBox Sofia' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Модерна фитнес зала в центъра на София' })
  @IsString()
  description_bg: string;

  @ApiProperty({ example: 'Modern fitness gym in the center of Sofia' })
  @IsString()
  description_en: string;

  @ApiProperty({ example: 'бул. Витоша 100, София' })
  @IsString()
  address: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  city_id: number;

  @ApiProperty({ example: 42.6977 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 23.3219 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: '+359 888 123 456' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'info@fitbox.bg' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'https://fitbox.bg' })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ example: 25, description: 'Training cost in EUR per session' })
  @IsNumber()
  training_price: number;

  @ApiPropertyOptional({ example: ['parking', 'showers', 'lockers'] })
  @IsArray()
  @IsOptional()
  amenities?: string[];

  @ApiPropertyOptional({ example: ['https://example.com/photo1.jpg'] })
  @IsArray()
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional({ example: [1, 3, 5], description: 'Training type IDs' })
  @IsArray()
  @IsOptional()
  training_type_ids?: number[];
}
