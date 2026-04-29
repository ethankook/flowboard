import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  identifier!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;
}
