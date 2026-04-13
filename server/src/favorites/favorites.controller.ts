import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { FavoritesService } from './favorites.service';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user favorites with venue details' })
  findAll(@CurrentUser() user: any) {
    return this.favoritesService.getByUser(user.id);
  }

  @Get('ids')
  @ApiOperation({ summary: 'Get venue IDs the user has favorited' })
  getIds(@CurrentUser() user: any) {
    return this.favoritesService.getVenueIds(user.id);
  }

  @Post(':venueId')
  @ApiOperation({ summary: 'Toggle favorite on a venue' })
  toggle(
    @Param('venueId', ParseUUIDPipe) venueId: string,
    @CurrentUser() user: any,
  ) {
    return this.favoritesService.toggle(user.id, venueId);
  }
}
