import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CurrentUser, Roles } from '../auth/decorators';
import { UserRole } from '../entities';
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@ApiTags('Trainers')
@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Get()
  @ApiOperation({ summary: 'Get trainers by venue' })
  @ApiQuery({ name: 'venue_id', type: String })
  findByVenue(@Query('venue_id') venueId: string) {
    return this.trainersService.findByVenue(venueId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a trainer by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a trainer to a venue (owner/admin)' })
  create(@Body() dto: CreateTrainerDto, @CurrentUser() user: any) {
    return this.trainersService.create(dto, user.id, user.role);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a trainer (venue owner/admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTrainerDto,
    @CurrentUser() user: any,
  ) {
    return this.trainersService.update(id, dto, user.id, user.role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a trainer (venue owner/admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.trainersService.remove(id, user.id, user.role);
  }
}
