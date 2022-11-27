import { Logger } from '../common';
import User from '../entities/User';
import UserService from './UserService';

const logger = Logger(__filename);

const authenticateLogin = async (
  email: string,
  password: string
): Promise<User | null> => {
  const user = await UserService.findByEmail(email);

  if (!user) {
    throw new Error('user_not_found');
  }

  try {
    const verified = await UserService.verifyPassword(password, user.password);

    if (verified) {
      return user;
    } else {
      throw new Error('wrong_username_or_password');
    }
  } catch (error: any) {
    logger.error(`Authentication failed in LoginService`);
    throw new Error('wrong_username_or_password');
  }
};

export default { authenticateLogin };
