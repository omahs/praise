import { UserAccount } from './api-schema';
import { apiClient } from './api';
import { randomBytes } from 'crypto';

/**
 * Fetch activateToken associated with userAccount from api
 *
 */
export const getActivateToken = async (
  userAccount: UserAccount,
  host: string
): Promise<string | undefined> => {
  const ua = {
    activateToken: randomBytes(10).toString('hex'),
  };

  const response = await apiClient
    .patch<typeof ua>(`/useraccounts/${userAccount._id}`, ua, {
      headers: { host: host },
    })
    .then((res) => res.data)
    .catch(() => undefined);

  return response?.activateToken;
};