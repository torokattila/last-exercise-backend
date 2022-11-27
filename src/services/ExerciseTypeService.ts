import { Logger } from 'common';
import ExerciseType from 'entities/ExerciseType';
import { getConnection } from 'typeorm';

const logger = Logger(__filename);
const getExerciseTypeRepository = () =>
  getConnection().getRepository(ExerciseType);

const create = async (
  exerciseType: Partial<ExerciseType>
): Promise<ExerciseType> => {
  try {
    return await getExerciseTypeRepository().save(exerciseType);
  } catch (error: any) {
    logger.error(`Cretate failed in ExerciseTypeService, error: ${error}`);
    throw new Error(error);
  }
};

const update = async (exerciseType: ExerciseType): Promise<ExerciseType> => {
  try {
    const editableExerciseType = exerciseType;
    editableExerciseType.modified = new Date();

    return await getExerciseTypeRepository().save(editableExerciseType);
  } catch (error: any) {
    logger.error(`Update failed in ExerciseTypeService, error: ${error}`);
    throw new Error(error);
  }
};

const remove = async (id: string): Promise<void> => {
  try {
    await getExerciseTypeRepository().delete(id);
  } catch (error: any) {
    logger.error(`Delete failed in ExerciseTypeService, error: ${error}`);
    throw new Error(error);
  }
};

export default {
  create,
  update,
  remove,
};
