import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const spotifyIdPattern = /^[A-Za-z0-9]{22}$/;
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const paletteEnum = z.enum(['warm', 'cool', 'mono', 'ink']);

const issues = defineCollection({
  loader: glob({ pattern: '*/index.yaml', base: './src/content/issues' }),
  schema: z.object({
    topic: z.string().min(1),
    releaseDate: z.string().regex(isoDate, 'releaseDate must be ISO YYYY-MM-DD'),
    summary: z.string().min(1).max(240),
    spotifyEpisodeId: z.string().regex(spotifyIdPattern).optional(),
    cover: z
      .object({
        image: z.string().min(1),
        alt: z.string().min(1),
        credit: z.string().optional()
      })
      .optional(),
    palette: paletteEnum.default('warm'),
    interactive: z.enum(['none', 'superposition']).default('none'),
    nextIssue: z
      .object({
        releaseDate: z.string().regex(isoDate)
      })
      .optional()
  })
});

const issueBodies = defineCollection({
  loader: glob({
    pattern: '*/da/*.md',
    base: './src/content/issues'
  }),
  schema: z.object({
    readingTimeMinutes: z.number().int().positive().optional()
  })
});

export const collections = { issues, issueBodies };
