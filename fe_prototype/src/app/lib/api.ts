import type { Job, Application } from '../data/mockData';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface ApiApplication {
  id: string;
  userId: string;
  job: Job;
  status: Application['status'];
  appliedAt: string;
  viewedAt?: string;
  updatedAt: string;
}

export interface ApiProfile {
  id?: string | number;
  userId: string;
  ghostMode: boolean;
  seeking: boolean;
  discoverable: boolean;
  blockedCompanies: string[];
  currentSalary: number;
  cvName: string;
  cvUpdatedAt: string;
  activeCvId?: string | null;
}

export interface ApiCv {
  id: string;
  userId: string;
  name: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}

export interface ApiFavorite {
  id?: string | number;
  userId: string;
  jobId: string;
  createdAt: string;
}

const BASE = '/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    throw new ApiError(`Request failed: ${res.status}`, res.status);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const usersApi = {
  async findByEmail(email: string): Promise<ApiUser | null> {
    const list = await request<ApiUser[]>(
      `/users?email=${encodeURIComponent(email.toLowerCase())}`
    );
    return list[0] ?? null;
  },

  async create(input: Omit<ApiUser, 'id' | 'createdAt'>): Promise<ApiUser> {
    return request<ApiUser>('/users', {
      method: 'POST',
      body: JSON.stringify({
        ...input,
        email: input.email.toLowerCase(),
        createdAt: new Date().toISOString(),
      }),
    });
  },
};

export const jobsApi = {
  list(): Promise<Job[]> {
    return request<Job[]>('/jobs');
  },
};

export const applicationsApi = {
  listByUser(userId: string): Promise<ApiApplication[]> {
    return request<ApiApplication[]>(
      `/applications?userId=${encodeURIComponent(userId)}&_sort=appliedAt&_order=desc`
    );
  },
  create(input: Omit<ApiApplication, 'id'>): Promise<ApiApplication> {
    return request<ApiApplication>('/applications', {
      method: 'POST',
      body: JSON.stringify({ ...input, id: `app-${Date.now()}` }),
    });
  },
  patch(id: string, partial: Partial<ApiApplication>): Promise<ApiApplication> {
    return request<ApiApplication>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(partial),
    });
  },
};

export const profilesApi = {
  async getByUser(userId: string): Promise<ApiProfile | null> {
    const list = await request<ApiProfile[]>(
      `/profiles?userId=${encodeURIComponent(userId)}`
    );
    return list[0] ?? null;
  },
  create(input: ApiProfile): Promise<ApiProfile> {
    return request<ApiProfile>('/profiles', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  patch(id: string | number, partial: Partial<ApiProfile>): Promise<ApiProfile> {
    return request<ApiProfile>(`/profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(partial),
    });
  },
};

export const favoritesApi = {
  listByUser(userId: string): Promise<ApiFavorite[]> {
    return request<ApiFavorite[]>(
      `/favorites?userId=${encodeURIComponent(userId)}`
    );
  },
  add(input: Omit<ApiFavorite, 'id' | 'createdAt'>): Promise<ApiFavorite> {
    return request<ApiFavorite>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ ...input, createdAt: new Date().toISOString() }),
    });
  },
  remove(id: string | number): Promise<void> {
    return request<void>(`/favorites/${id}`, { method: 'DELETE' });
  },
};

export const cvsApi = {
  listByUser(userId: string): Promise<ApiCv[]> {
    return request<ApiCv[]>(
      `/cvs?userId=${encodeURIComponent(userId)}&_sort=uploadedAt&_order=desc`
    );
  },
  create(input: Omit<ApiCv, 'id' | 'uploadedAt'>): Promise<ApiCv> {
    return request<ApiCv>('/cvs', {
      method: 'POST',
      body: JSON.stringify({
        ...input,
        id: `cv-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      }),
    });
  },
  remove(id: string): Promise<void> {
    return request<void>(`/cvs/${id}`, { method: 'DELETE' });
  },
};
