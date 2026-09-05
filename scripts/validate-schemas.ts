import { Schema } from '@sanity/schema';
import post from '../sanity/schemas/post';
import category from '../sanity/schemas/category';
import tag from '../sanity/schemas/tag';
const schema = Schema.compile({ name: 'tjg-blog', types: [post, category, tag] });
for (const name of ['post', 'category', 'tag']) if (!schema.get(name)) throw new Error(`Missing schema ${name}`);
console.log('All three Sanity schemas compile successfully.');
