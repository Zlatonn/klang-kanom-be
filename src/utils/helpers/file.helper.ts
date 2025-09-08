import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

export const getImageDirectory = () => {
  return join(process.cwd(), 'public/images');
};

export const safeUnlink = (filePath: string) => {
  if (!existsSync(filePath)) {
    return;
  }

  try {
    unlinkSync(filePath);
  } catch (error) {
    console.log(`Failed to delete file: ${filePath}`, error);
  }
};
