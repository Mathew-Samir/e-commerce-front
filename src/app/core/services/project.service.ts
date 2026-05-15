import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProjectResponse, SingleProjectResponse } from '../interface/project.interface';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/projects`;

  getProjects() {
    return this.http.get<ProjectResponse>(this.apiUrl);
  }

  createProject(data: any) {
    return this.http.post<SingleProjectResponse>(this.apiUrl, data);
  }

  updateProject(id: string, data: any) {
    return this.http.put<SingleProjectResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteProject(id: string) {
    return this.http.delete<SingleProjectResponse>(`${this.apiUrl}/${id}`);
  }
}
