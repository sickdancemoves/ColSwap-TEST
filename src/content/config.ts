import { defineCollection, z } from 'astro:content';

const localeEnum = z.enum(['es', 'en']);

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1).max(120),
    urlSlug: z.string().regex(/^[a-z0-9-]+$/, 'kebab-case only'),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    summary: z.string().min(20).max(300),
    tags: z.array(z.string()).default([]),
    author: z.string().default('ColSwap'),
    heroImage: z.string().optional(),
    locale: localeEnum,
    draft: z.boolean().default(false),
  }),
});

const faqs = defineCollection({
  type: 'content',
  schema: z.object({
    question: z.string().min(5).max(200),
    category: z.enum(['general', 'compliance', 'fees', 'process', 'security']),
    order: z.number().int().nonnegative(),
    locale: localeEnum,
  }),
});

const legal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1),
    urlSlug: z.enum([
      'terminos',
      'privacidad',
      'aml',
      'cookies',
      'terms',
      'privacy',
    ]),
    lastUpdated: z.coerce.date(),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'semver'),
    locale: localeEnum,
  }),
});

export const collections = { blog, faqs, legal };
