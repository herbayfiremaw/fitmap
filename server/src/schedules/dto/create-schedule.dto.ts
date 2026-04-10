import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  venue_id: string;

  @ApiProperty({ example: 1, description: 'Training type ID' })
  @IsInt()
  training_type_id: number;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  @IsOptional()
  trainer_id?: string;

  @ApiProperty({ example: 1, description: '0=Sunday, 1=Monday, ..., 6=Saturday' })
  @IsInt()
  @Min(0)
  @Max(6)
  day_of_week: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  start_time: string;

  @ApiProperty({ example: '10:30' })
  @IsString()
  end_time: string;
}
