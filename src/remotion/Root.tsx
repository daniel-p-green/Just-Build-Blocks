import type { FC } from 'react';
import { Composition, Still } from 'remotion';
import { z } from 'zod';

import type { ScenePack } from '../lib/scene-pack';
import { ArcScene16x9 } from './ArcScene16x9';
import { BrandStill16x9 } from './BrandStill16x9';
import { MasterConceptFilm16x9 } from './MasterConceptFilm16x9';
import { RevealScene16x9 } from './RevealScene16x9';
import { sampleScenePack } from './sample-scene-pack';

const ScenePackValueSchema: z.ZodType<ScenePack> = z.custom<ScenePack>();
const ScenePackPropsSchema = z.object({ scenePack: ScenePackValueSchema });
const RevealFaithfulSchema = z.object({
  revealMode: z.literal('faithful').optional(),
  scenePack: ScenePackValueSchema,
});
const RevealImaginationSchema = z.object({
  revealMode: z.literal('imagination').optional(),
  scenePack: ScenePackValueSchema,
});
const ArcSceneSchema = z.object({
  arcIndex: z.union([z.literal(0), z.literal(1), z.literal(2)]),
  scenePack: ScenePackValueSchema,
});

export const RemotionRoot: FC = () => {
  return (
    <>
      <Still
        component={BrandStill16x9}
        defaultProps={{ scenePack: sampleScenePack }}
        height={900}
        id="BrandStill16x9"
        schema={ScenePackPropsSchema}
        width={1600}
      />
      <Composition
        component={RevealScene16x9}
        defaultProps={{ revealMode: 'faithful', scenePack: sampleScenePack }}
        durationInFrames={480}
        fps={30}
        height={900}
        id="RevealFaithful16x9"
        schema={RevealFaithfulSchema}
        width={1600}
      />
      <Composition
        component={RevealScene16x9}
        defaultProps={{ revealMode: 'imagination', scenePack: sampleScenePack }}
        durationInFrames={480}
        fps={30}
        height={900}
        id="RevealImagination16x9"
        schema={RevealImaginationSchema}
        width={1600}
      />
      <Composition
        component={ArcScene16x9}
        defaultProps={{ arcIndex: 0, scenePack: sampleScenePack }}
        durationInFrames={270}
        fps={30}
        height={900}
        id="Arc01InstantMagic16x9"
        schema={ArcSceneSchema}
        width={1600}
      />
      <Composition
        component={ArcScene16x9}
        defaultProps={{ arcIndex: 1, scenePack: sampleScenePack }}
        durationInFrames={330}
        fps={30}
        height={900}
        id="Arc02NostalgiaBridge16x9"
        schema={ArcSceneSchema}
        width={1600}
      />
      <Composition
        component={ArcScene16x9}
        defaultProps={{ arcIndex: 2, scenePack: sampleScenePack }}
        durationInFrames={300}
        fps={30}
        height={900}
        id="Arc03WorldBuilding16x9"
        schema={ArcSceneSchema}
        width={1600}
      />
      <Composition
        component={MasterConceptFilm16x9}
        defaultProps={{ scenePack: sampleScenePack }}
        durationInFrames={960}
        fps={30}
        height={900}
        id="MasterConceptFilm16x9"
        schema={ScenePackPropsSchema}
        width={1600}
      />
    </>
  );
};
