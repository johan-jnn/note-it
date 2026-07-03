import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Assignment } from './entities/assignment.entity';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  async create(
    @Body() createAssignmentDto: CreateAssignmentDto,
  ): Promise<Assignment> {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Get()
  async findAll(): Promise<Assignment[]> {
    return this.assignmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Assignment> {
    return this.assignmentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<Assignment> {
    return this.assignmentsService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.assignmentsService.remove(id);
    return {
      message: `Assignment with ID ${id} has been successfully deleted`,
    };
  }
}
