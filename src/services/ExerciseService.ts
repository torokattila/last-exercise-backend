import { randomInt } from "crypto";
import { getConnection } from 'typeorm';
import { Logger } from '../common';
import Exercise from '../entities/Exercise';
import ExerciseTypeService from './ExerciseTypeService';

const logger = Logger(__filename);
const getExerciseRepository = () => getConnection().getRepository(Exercise);

const create = async (exercise: Partial<Exercise>): Promise<Exercise> => {
  try {
    const newExercise = exercise;
    newExercise.userId = exercise.userId;

    const result = await getExerciseRepository().save(newExercise);

    if (newExercise.exerciseTypes) {
      for (const type of newExercise.exerciseTypes) {
        type.exerciseId = result.id;
        await ExerciseTypeService.create(type);
      }
    }

    return result;
  } catch (error: any) {
    logger.error(`Create failed in ExerciseService, error: ${error}`);
    throw new Error(error);
  }
};

const findById = async (id: number): Promise<Exercise> => {
  try {
    const queryBuilder = getExerciseRepository().createQueryBuilder('exercise');
    queryBuilder.leftJoinAndSelect('exercise.exerciseTypes', 'exerciseTypes');
    queryBuilder.andWhere('exercise.id = :id', { id });

    const exercise = await queryBuilder.getOne();

    return Promise.resolve(exercise);
  } catch (error: any) {
    logger.error(`Find by id failed in ExerciseService, error: ${error}`);
    throw new Error(error);
  }
};

const list = async (userId: string): Promise<Exercise[]> => {
  try {
    const queryBuilder = getExerciseRepository().createQueryBuilder('exercise');
    queryBuilder.leftJoinAndSelect('exercise.exerciseTypes', 'exerciseTypes');
    queryBuilder.andWhere('exercise.userId = :userId', { userId });

    return await queryBuilder.getMany();
  } catch (error: any) {
    logger.error(`List failed in ExerciseService, error: ${error}`);
    throw new Error(error);
  }
};

const update = async (exercise: Partial<Exercise>): Promise<Exercise> => {
  try {
    const editableExercise = exercise;

    if (exercise.exerciseTypes) {
      for (const type of exercise.exerciseTypes) {
        if (!type.id) {
          const newType = type;
          newType.id = randomInt(100000000, 2147483647);

          await ExerciseTypeService.create(type);
        } else {
          await ExerciseTypeService.update(type);
        }
      }
    }

    editableExercise.modified = new Date();

    return await getExerciseRepository().save(editableExercise);
  } catch (error: any) {
    logger.error(`Update failed in ExerciseService, error: ${error}`);
    throw new Error(error);
  }
};

const remove = async (id: string): Promise<void> => {
  try {
    await getExerciseRepository().delete(id);
  } catch (error: any) {
    logger.error(`Delete failed in ExerciseService, error: ${error}`);
    throw new Error(error);
  }
};

export default {
  create,
  list,
  findById,
  update,
  remove,
};
