import { ApiResponse } from './api-response.interface';

export interface Project {
  _id: string;
  name: string;
  title?: string;
  image?: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectResponse = ApiResponse<Project[]>;
export type SingleProjectResponse = ApiResponse<Project>;
