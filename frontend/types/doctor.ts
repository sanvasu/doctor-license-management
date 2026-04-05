export type DoctorStatus = 'Active' | 'Expired' | 'Suspended';

export interface Doctor {
  id: string;
  fullName: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  status: DoctorStatus;
  createdDate: string;
  updatedDate?: string;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateDoctorDto {
  fullName: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  licenseExpiryDate: string;
}

export interface UpdateDoctorDto {
  fullName: string;
  email: string;
  specialization: string;
  licenseNumber: string;
  licenseExpiryDate: string;
}

export interface DoctorFilters {
  search: string;
  status: string;
  pageNumber: number;
  pageSize: number;
}