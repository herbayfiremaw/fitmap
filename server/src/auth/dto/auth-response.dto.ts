import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../entities';

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  access_token: string;

  @ApiProperty({
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Ivan Ivanov',
      email: 'ivan@example.com',
      role: 'user',
    },
  })
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}
