import { Role } from '@prisma/client';

export interface UserPayload {
  id: number;
  username: string;
  role: Role;
}
