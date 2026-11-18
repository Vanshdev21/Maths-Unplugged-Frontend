export interface CloudImage {
  public_id?: string;
  url?: string;
}

export type Role = "user" | "admin";

export interface UserSnapshot {
  _id: string;
  name: string;
  avatar?: string;
  role?: Role;
}

/** Older records store only the user's id; newer ones store a snapshot. */
export type CommentAuthor = UserSnapshot | string;

export interface CommentImage {
  public_id: string;
  url: string;
  width?: number;
  height?: number;
}

export interface CourseComment {
  _id: string;
  user: CommentAuthor;
  comment: string;
  images?: CommentImage[];
  editedAt?: string;
  commentReplies?: CourseComment[];
  createdAt?: string;
}

export interface Review {
  _id: string;
  user: CommentAuthor;
  rating: number;
  comment: string;
  commentReplies?: CourseComment[];
  createdAt?: string;
}

export interface LessonLink {
  _id?: string;
  title: string;
  url: string;
}

export interface LessonFile {
  public_id: string;
  name: string;
  bytes: number;
  format: string;
  mimeType: string;
}

export type LessonContentType = "video" | "document";

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  /** Missing on older lessons, which are all videos. */
  contentType?: LessonContentType;
  file?: LessonFile | null;
  documentUrl?: string;
  allowDownload?: boolean;
  videoUrl?: string;
  videoSection: string;
  videoLength: number;
  videoPlayer?: string;
  links?: LessonLink[];
  suggestion?: string;
  questions?: CourseComment[];
}

export interface Course {
  _id: string;
  name: string;
  description: string;
  price: number;
  estimatedPrice?: number;
  thumbnail?: CloudImage;
  tags: string;
  level: string;
  demoUrl?: string;
  benefits?: { _id?: string; title: string }[];
  prerequisites?: { _id?: string; title: string }[];
  reviews?: Review[];
  courseData?: Partial<Lesson>[];
  ratings?: number;
  purchased?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseContent {
  _id: string;
  name: string;
  courseData: Lesson[];
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: CloudImage;
  role: Role;
  isVerified: boolean;
  courses?: { courseId: string; _id?: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  _id: string;
  courseId: string | { _id: string; name: string; price: number } | null;
  userId: string | { _id: string; name: string; email: string } | null;
  payment_info: {
    method?: string;
    amount?: number;
    currency?: string;
    status?: string;
    payment_id?: string;
    order_id?: string;
  };
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  status: "read" | "unread";
  createdAt: string;
}

export interface MonthCount {
  month: string;
  count: number;
}

export interface FaqItem {
  _id?: string;
  question: string;
  answer: string;
}

export interface Layout {
  _id: string;
  type: "Banner" | "FAQ" | "Categories";
  faq?: FaqItem[];
  categories?: { _id?: string; title: string }[];
  banner?: { image?: CloudImage; title: string; subTitle: string };
}

export interface ApiMessage {
  success: boolean;
  message?: string;
}

/* ---------- Editable content pages (About, Terms, Privacy, Refund) ---------- */

export type PageSlug = "about" | "terms" | "privacy" | "refund-policy";

export interface PageImage {
  public_id: string;
  url: string;
}

export interface PageSection {
  _id?: string;
  heading: string;
  /** Plain text. Blank line = new paragraph, "- " = bullet, **bold**, [text](link). */
  body: string;
  image?: PageImage;
}

export interface SitePage {
  slug: PageSlug;
  title: string;
  subtitle?: string;
  heroImage?: PageImage;
  highlights: { value: string; label: string }[];
  sections: PageSection[];
  cta?: { text: string; href: string };
  showContact: boolean;
  updatedAt?: string;
}
