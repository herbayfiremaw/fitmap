import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCityDto {
  @ApiProperty({ example: 'София' })
  @IsString()
  name_bg: string;

  @ApiProperty({ example: 'Sofia' })
  @IsString()
  name_en: string;

  @ApiProperty({ example: 'sofia' })
  @IsString()
  slug: string;
}
