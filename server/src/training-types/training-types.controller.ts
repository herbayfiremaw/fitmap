import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { UserRole } from '../entities';
import { TrainingTypesService } from './training-types.service';
import { CreateTrainingTypeDto } from './dto/create-training-type.dto';
import { UpdateTrainingTypeDto } from './dto/update-training-type.dto';

@ApiTags('Training Types')
@Controller('training-types')
export class TrainingTypesController {
  constructor(private readonly service: TrainingTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all training types' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a training type by ID' })
  @ApiNotFoundResponse({ description: 'Training type not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a training type (admin only)' })
  create(@Body() dto: CreateTrainingTypeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a training type (admin only)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTrainingTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a training type (admin only)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
