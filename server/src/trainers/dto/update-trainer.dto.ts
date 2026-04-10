import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateTrainerDto } from './create-trainer.dto';

export class UpdateTrainerDto extends PartialType(
  OmitType(CreateTrainerDto, ['venue_id']),
) {}
