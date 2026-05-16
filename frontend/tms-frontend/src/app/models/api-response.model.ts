// models/api-response.model.ts
// Generic wrapper matching the Spring Boot ApiResponse<T> pattern

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
