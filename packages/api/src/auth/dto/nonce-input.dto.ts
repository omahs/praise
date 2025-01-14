import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEthAddress } from '../../shared/validators/is-eth-address.validator';

export class NonceInputDto {
  @ApiProperty({
    example: '0xAAB27b150451726EC7738aa1d0A94505c8729bd1',
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @IsEthAddress()
  identityEthAddress: string;
}
