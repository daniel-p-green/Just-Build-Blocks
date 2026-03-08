import type { ReactNode } from 'react';

import { ExperienceContext, type ExperienceContextValue } from './experience-context';

export function ExperienceProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ExperienceContextValue;
}) {
  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}
