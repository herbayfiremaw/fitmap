import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../entities';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepo: Repository<City>,
  ) {}

  findAll(): Promise<City[]> {
    return this.cityRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<City> {
    const city = await this.cityRepo.findOneBy({ id });
    if (!city) throw new NotFoundException('City not found');
    return city;
  }

  create(dto: CreateCityDto): Promise<City> {
    return this.cityRepo.save(this.cityRepo.create(dto));
  }

  async update(id: number, dto: UpdateCityDto): Promise<City> {
    const city = await this.findOne(id);
    Object.assign(city, dto);
    return this.cityRepo.save(city);
  }

  async remove(id: number): Promise<void> {
    const city = await this.findOne(id);
    await this.cityRepo.remove(city);
  }
}
