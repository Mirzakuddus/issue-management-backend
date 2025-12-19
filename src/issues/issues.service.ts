import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';

@Injectable()
export class IssuesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateIssueDto, user: any) {
    return this.prisma.issue.create({
      data: {
        title: createDto.title,
        description: createDto.description,
        organizationId: user.organizationId,
      },
    });
  }

  async findAll(user: any) {
    return this.prisma.issue.findMany({ where: { organizationId: user.organizationId } });
  }

  async findOne(id: string, user: any) {
    const issue = await this.prisma.issue.findUnique({ where: { id } });
    if (!issue || issue.organizationId !== user.organizationId) throw new NotFoundException();
    return issue;
  }

  async update(id: string, updateDto: UpdateIssueDto, user: any) {
    const issue = await this.findOne(id, user);
    // Authorization: only ADMIN can change status or assignee
    if ((updateDto.status || updateDto.assigneeId) && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN may change status or assignee');
    }

    const data: any = {};
    if (updateDto.title !== undefined) data.title = updateDto.title;
    if (updateDto.description !== undefined) data.description = updateDto.description;
    if (updateDto.status !== undefined) data.status = updateDto.status;
    if (updateDto.assigneeId !== undefined) data.assigneeId = updateDto.assigneeId;

    const updated = await this.prisma.issue.update({ where: { id }, data });

    // Activity logging for status or assignee changes
    if (updateDto.status !== undefined && updateDto.status !== issue.status) {
      await this.prisma.activityLog.create({
        data: {
          issueId: id,
          organizationId: user.organizationId,
          type: 'status',
          before: issue.status,
          after: updateDto.status,
          userId: user.id,
        },
      });
    }

    if (updateDto.assigneeId !== undefined && updateDto.assigneeId !== issue.assigneeId) {
      await this.prisma.activityLog.create({
        data: {
          issueId: id,
          organizationId: user.organizationId,
          type: 'assignee',
          before: issue.assigneeId,
          after: updateDto.assigneeId,
          userId: user.id,
        },
      });
    }

    return updated;
  }

  async remove(id: string, user: any) {
    const issue = await this.findOne(id, user);
    // Only admin can delete
    if (user.role !== 'ADMIN') throw new ForbiddenException('Only ADMIN may delete issues');
    await this.prisma.issue.delete({ where: { id } });
    return { deleted: true };
  }
}
