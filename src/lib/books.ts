// The press's books: one YAML file each in content/books/, newest first.
import { parse } from 'yaml';

export interface Book {
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  authorNote?: string;
  published: Date;
  cover: { src: string; width: number; height: number; colour: string; alt: string };
  hook: string;
  blurb: string[];
  details: { label: string; value: string }[];
  links: { label: string; href: string }[];
}

const files = import.meta.glob('../../content/books/*.yaml', { query: '?raw', import: 'default', eager: true });

export const BOOKS: Book[] = Object.entries(files)
  .map(([path, raw]) => {
    const data = parse(raw as string) as Omit<Book, 'slug' | 'published'> & { published: string | Date };
    return {
      ...data,
      published: new Date(data.published),
      slug: path.split('/').pop()!.replace(/\.yaml$/, ''),
    };
  })
  .sort((a, b) => b.published.getTime() - a.published.getTime());
