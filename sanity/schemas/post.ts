import { defineType, defineField } from '@sanity/client';

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'category' }] }],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
    }),
    defineField({
      name: 'contentSource',
      title: 'Content Source',
      type: 'string',
      options: {
        list: [
          { title: 'Legacy HTML (migrated from WordPress)', value: 'legacyHtml' },
          { title: 'Portable Text (native Sanity)', value: 'portableText' },
        ],
      },
      initialValue: 'portableText',
    }),
    defineField({
      name: 'body',
      title: 'Body (Portable Text)',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
      hidden: ({ parent }) => parent?.contentSource === 'legacyHtml',
    }),
    defineField({
      name: 'legacyHtml',
      title: 'Legacy HTML Content',
      type: 'text',
      hidden: ({ parent }) => parent?.contentSource !== 'legacyHtml',
    }),
    defineField({
      name: 'wordCount',
      title: 'Word Count',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'featuredImage',
      date: 'publishedAt',
    },
    prepare({ title, media, date }) {
      return {
        title,
        media,
        subtitle: date ? new Date(date).toLocaleDateString() : 'No date',
      };
    },
  },
});
