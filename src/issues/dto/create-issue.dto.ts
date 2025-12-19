import { IsString, IsOptional } from 'class-validator';

export class CreateIssueDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
}
