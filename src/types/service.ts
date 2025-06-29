
export interface ServiceTask {
  id: string;
  title: string;
  status: "pending" | "in-progress" | "completed";
  description?: string;
  completedDate?: string;
  technician?: string;
  images?: {
    url: string;
    title: string;
    category?: string;
    customerId?: string;
  }[];
}
