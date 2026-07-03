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
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Grade } from './entities/grade.entity';
import { isSubjectValidated } from './grade-average.util';

@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  async create(@Body() createGradeDto: CreateGradeDto): Promise<Grade> {
    return this.gradesService.create(createGradeDto);
  }

  @Get()
  async findAll(): Promise<Grade[]> {
    return this.gradesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Grade> {
    return this.gradesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGradeDto: UpdateGradeDto,
  ): Promise<Grade> {
    return this.gradesService.update(id, updateGradeDto);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.gradesService.remove(id);
    return { message: `Grade with ID ${id} has been successfully deleted` };
  }

  @Get('average/:studentId/:subjectId')
  async getAverage(
    @Param('studentId') studentId: string,
    @Param('subjectId', ParseIntPipe) subjectId: number,
  ): Promise<{ average: number | null; validated: boolean | null }> {
    const average = await this.gradesService.getStudentSubjectAverage(
      studentId,
      subjectId,
    );
    return { average, validated: isSubjectValidated(average) };
  }
}
