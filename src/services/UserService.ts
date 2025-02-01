import bcrypt from 'bcrypt';
import { Logger } from 'common';
import User from '../entities/User';
import { getConnection } from 'typeorm';
import ExerciseService from './ExerciseService';

const logger = Logger(__filename);
const getUserRepository = () => getConnection().getRepository(User);

const findByEmail = async (email: string) => {
  try {
    const foundUser = await getUserRepository().findOne({
      where: { email },
    });

    return foundUser;
  } catch (error: any) {
    logger.error(`Find by email failed in UserService, error: ${error}`);
    throw new Error(error);
  }
};

const findById = async (userId: string): Promise<User> => {
  try {
    const queryBuilder = getUserRepository().createQueryBuilder('user');
    queryBuilder.leftJoinAndSelect('user.exercises', 'exercises');
    queryBuilder.leftJoinAndSelect('exercises.exerciseTypes', 'exerciseTypes');
    queryBuilder.leftJoinAndSelect('user.lastExercise', 'lastExercise');
    queryBuilder.leftJoinAndSelect(
      'lastExercise.exerciseTypes',
      'lastExerciseTypes'
    );
    queryBuilder.andWhere('user.id = :id', { id: userId });

    const user = await queryBuilder.getOne();
    delete user.password;

    return Promise.resolve(user);
  } catch (error: any) {
    logger.error(`Find by id failed in UserService, error: ${error}`);
    throw new Error(error);
  }
};

const update = async (id: string, user: Partial<User>): Promise<User> => {
  try {
    const editedUser = user;
    editedUser.modified = new Date();

    await getUserRepository().update(id, editedUser);

    const result = await findById(id);

    return result;
  } catch (error: any) {
    logger.error(`Update failed in UserService, error: ${error}`);
    throw new Error(error);
  }
};

const save = async (user: User): Promise<User> => {
  try {
    const savedUser = await getUserRepository().save(user);

    return savedUser;
  } catch (error: any) {
    logger.error(`Save failed in UserService, error: ${error}`);
    throw new Error(error);
  }
};

const updatePassword = async (
  id: string,
  newPassword: string
): Promise<User> => {
  try {
    const foundUser = await getUserRepository().findOne({
      where: { id },
    });
    foundUser.password = await generateHash(newPassword);
    foundUser.modified = new Date();

    const savedUser = await getUserRepository().save(foundUser);
    delete savedUser.password;

    return savedUser;
  } catch (error: any) {
    logger.error(`Update password failed in UserService, error: ${error}`);
    throw new Error(error);
  }
};

const updateLastExercise = async (
  userId: string,
  exerciseId: string,
  duration: string
): Promise<User> => {
  try {
    const foundUser = await getUserRepository().findOne({
      where: { id: userId },
    });

    if (!foundUser) throw new Error('User not found');

    foundUser.modified = new Date();
    foundUser.lastExerciseId = exerciseId;

    const foundExercise = await ExerciseService.findById(exerciseId);
    foundExercise.duration = duration;

    await ExerciseService.update(foundExercise);

    // Update exercise history
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    foundUser.exerciseHistory = [
      ...(foundUser.exerciseHistory ?? []),
      { date: today, exerciseId },
    ];

    const savedUser = await save(foundUser);

    return savedUser;
  } catch (error: any) {
    logger.error(`Update last exercise failed in UserService, error: ${error}`);
    throw new Error(error);
  }
};

const getUserExerciseHistory = async (userId: string) => {
  const user = await getUserRepository().findOne({
    where: { id: userId },
    select: ['exerciseHistory'],
  });

  if (!user) throw new Error('User not found');

  return user.exerciseHistory;
};

const remove = async (id: string): Promise<void> => {
  try {
    await getUserRepository().delete(id);
  } catch (error: any) {
    logger.error(`Remove failed in UserService, error: ${error}`);
    throw new Error(error);
  }
};

const comparePassword = async (
  password1: string,
  password2: string
): Promise<boolean> => {
  return await bcrypt.compare(password1, password2);
};

const generateHash = async (hashBase: string) => {
  return await bcrypt.hash(hashBase, 10);
};

const verifyPassword = async (
  password1: string,
  password2: string
): Promise<boolean> => {
  return await bcrypt.compare(password1, password2);
};

const validatePasswordMatch = (password: string, passwordConfirm: string) => {
  if (!password || password !== passwordConfirm) return false;

  return true;
};

export default {
  findByEmail,
  findById,
  save,
  update,
  updatePassword,
  updateLastExercise,
  remove,
  comparePassword,
  generateHash,
  verifyPassword,
  validatePasswordMatch,
  getUserExerciseHistory,
};
