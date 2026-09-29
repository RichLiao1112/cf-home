export interface Card {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  coverColor?: string;
  wanLink?: string;
  lanLink?: string;
  openInNewWindow: boolean;
  position: number;
  categoryId: string;
}

export interface Category {
  id: string;
  title: string;
  color?: string;
  position: number;
  cards: Card[];
}

export interface HeadLayout {
  name: string;
  subtitle?: string;
  siteImage?: string;
  backgroundImage?: string;
  backgroundBlur: number;
  unsplashCollectionId?: string;
  desktopColumns: number;
  navOpacity: number;
  overlayOpacity: number;
  categoryOpacity: number;
  cardOpacity: number;
}

export interface DeletedCardItem {
  recycleId: string;
  deletedAt: string;
  sourceCategoryId: string;
  sourceCategoryTitle: string;
  data: Card;
}

export interface DeletedCategoryItem {
  recycleId: string;
  deletedAt: string;
  data: Category;
}

export interface RecycleBin {
  categories: DeletedCategoryItem[];
  cards: DeletedCardItem[];
}

export interface ProfileData {
  layout: {
    head: HeadLayout;
  };
  categories: Category[];
  recycleBin: RecycleBin;
  updatedAt?: string;
}

export interface SnapshotMeta {
  id: string;
  key: string;
  createdAt: string;
  reason: 'manual' | 'auto' | 'before_restore';
  note?: string;
}

export interface SnapshotItem extends SnapshotMeta {
  hash: string;
  data: ProfileData;
}

export interface NetworkContext {
  clientIP: string;
  isPrivate: boolean;
  networkType: 'lan' | 'wan';
}

export interface AuthSession {
  authenticated: boolean;
  userEmail?: string;
  isZeroTrust: boolean;
}

export type ThemePreset = 'linear' | 'apple';

