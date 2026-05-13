export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image?: string;
}

export interface Book {
  id: string;
  name: string;
  slug: string;
  count: number;
  parent: string;
  description: string;
  coverColor?: string;
  image?: string;
  muallif: string;
}

export type Theme = 'light' | 'sepia' | 'dark';
export type FontFamily = 'sans' | 'serif' | 'mono';
