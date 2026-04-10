import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTrainingTypeDto {
  @ApiProperty({ example: 'Бокс' })
  @IsString()
  name_bg: string;

  @ApiProperty({ example: 'Boxing' })
  @IsString()
  name_en: string;

  @ApiProperty({ example: 'boxing' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'boxing' })
  @IsString()
  icon: string;
}
