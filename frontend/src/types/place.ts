export interface Place {
  _id: string; // MongoDB의 기본 ID
  name: string;
  description?: string;
  category: string; // config에서 가져온 CULTURAL_CATEGORY 기반
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: string;
  website?: string;
  imageUrl?: string;
  openingHours?: string;
  licenseInfo?: string;
  sourceId: string;
  reviews: string[]; // Review ID 배열
  favoritesCount: number;
  originalTags: any; // Mixed 타입이므로 any 또는 Record<string, any>
  proposedBy?: string; // User ID
  registeredBy?: string; // Admin User ID
  createdAt: string;
  updatedAt: string;
  
  // 만약 API 응답에서 가공된 데이터(평균 평점 등)가 온다면 추가
  averageRating?: number;
  reviewCount?: number;
}