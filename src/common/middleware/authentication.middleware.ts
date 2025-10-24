import { BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';


export const preAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!(req.headers.authorization?.split(' ')?.length == 2)) {
    throw new BadRequestException('Missing Authorization key')
  }

  next();
};
