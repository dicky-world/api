import { Response } from 'express';

class Health {
  static check = (res: Response) => {
    res.status(200);
  };
}

export { Health };
