export interface Item {
  id: string;
  user_id: string;
  type: "lost" | "found";
  title: string;
  description?: string;
  category: string;
  location: string;
  date: string;
  contact: string;
  image_url?: string;
  status: "open" | "resolved";
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  karma_points: number;
  created_at: string;
}
