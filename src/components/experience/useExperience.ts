import { useContext } from 'react';

import { ExperienceContext } from './experience-context';

export const useExperience = () => {
  const value = useContext(ExperienceContext);

  if (!value) {
    throw new Error('useExperience must be used inside ExperienceContext.');
  }

  return value;
};
