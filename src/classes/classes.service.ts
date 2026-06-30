import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { Class } from './entities/class.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const newClass = this.classRepository.create(createClassDto);
    return await this.classRepository.save(newClass);
  }

  async findAll(): Promise<Class[]> {
    return await this.classRepository.find();
  }

  async findOne(id: number): Promise<Class> {
    const foundClass = await this.classRepository.findOne({ where: { id } });
    if (!foundClass) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return foundClass;
  }

  async update(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
    const existingClass = await this.findOne(id);
    Object.assign(existingClass, updateClassDto);
    return await this.classRepository.save(existingClass);
  }

  async remove(id: number): Promise<void> {
    const existingClass = await this.findOne(id);
    await this.classRepository.remove(existingClass);
  }
}
