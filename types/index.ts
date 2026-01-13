export interface Item {
  id: string;
  user_id: string;
  type: "LOST" | "FOUND";
  title: string;
  description?: string;
  category: string;
  location_zone: string;
  date: string;
  contact: string;
  image_url?: string;
  creator_id?: string;
  participants?: {
    user_id: string;
    user?: User;
  }[];
  last_message_at?: string;
  status: "OPEN" | "RESOLVED";
  created_at: string;
  updated_at?: string;
}

export interface ScanResultItem {
  label: string;
  score: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  karma_points: number;
  created_at: string;
}
