import { check, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateInput = [
  check('email')
    .isEmail()
    .withMessage('Must be a valid email'),
  check('password')
    .isLength({ min: 5 })
    .withMessage('Must be at least 5 chars long'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
