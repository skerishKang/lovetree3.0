export interface CommunityTreeSnapshot {
  id: string;
  title: string;
  visibility: string;
  createdAt: string | null;
  updatedAt: string | null;
  representativeThumbnail: string;
  representativeMemorySourceUrl: string;
  memoryCount: number;
  emotionTags: string[];
  stage: string;
  theme: string;
  timeRange: string;
  likeCount?: number;
  viewCount?: number;
}

export type CommunityListStatus = "loading" | "success" | "empty" | "error";

export interface CommunityListState {
  items: CommunityTreeSnapshot[];
  status: CommunityListStatus;
  error: string | null;
}
