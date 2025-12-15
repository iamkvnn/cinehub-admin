import { Request, Response, NextFunction } from 'express';
import { validate as classValidate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ApiError } from '../utils/ApiError';

export const validate = (dtoClass: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObj = plainToInstance(dtoClass, req.body);
    const errors = await classValidate(dtoObj);

    if (errors.length > 0) {
      const errorMessages = errors.map((error) => Object.values(error.constraints || {})).flat();
      next(new ApiError(400, 'Validation Error', errorMessages));
    } else {
      req.body = dtoObj;
      next();
    }
  };
};
