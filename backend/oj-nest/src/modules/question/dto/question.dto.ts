import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TestPointDto {
  @IsOptional()
  questionId?: string;

  @IsString()
  @IsOptional()
  input?: string;

  @IsString()
  @IsOptional()
  output?: string;

  @IsNumber()
  @IsOptional()
  isSample?: number;

  @IsOptional()
  createTime?: Date;

  @IsOptional()
  updateTime?: Date;
}

export class AddTestQuestionDto {
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsNumber()
  @IsOptional()
  testPointNum?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  limitedTime?: number;

  @IsOptional()
  createTime?: Date;

  @IsOptional()
  updateTime?: Date;

  @ValidateNested({ each: true })
  @Type(() => TestPointDto)
  @IsOptional()
  testPointList?: TestPointDto[];
}

export class SubmitTestQuestionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
