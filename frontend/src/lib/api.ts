export class ApiError extends Error {
  status: number;
  details: string[];

  constructor(status: number, message: string, details: string[] = []) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });

  if (!res.ok) {
    let message = res.statusText;
    let details: string[] = [];
    try {
      const body = await res.json();
      if (Array.isArray(body.message)) {
        details = body.message;
        message = details.join(', ');
      } else if (typeof body.message === 'string') {
        message = body.message;
      }
    } catch {
      // no JSON body to parse
    }
    throw new ApiError(res.status, message, details);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface Resource<TEntity, TCreate, TUpdate = Partial<TCreate>> {
  list(): Promise<TEntity[]>;
  get(id: number): Promise<TEntity>;
  create(data: TCreate): Promise<TEntity>;
  update(id: number, data: TUpdate): Promise<TEntity>;
  remove(id: number): Promise<{ message: string }>;
}

function resourceClient<TEntity, TCreate, TUpdate = Partial<TCreate>>(
  path: string,
): Resource<TEntity, TCreate, TUpdate> {
  return {
    list: () => apiFetch<TEntity[]>(path),
    get: (id) => apiFetch<TEntity>(`${path}/${id}`),
    create: (data) => apiFetch<TEntity>(path, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) =>
      apiFetch<TEntity>(`${path}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id) => apiFetch<{ message: string }>(`${path}/${id}`, { method: 'DELETE' }),
  };
}

// --- Related entities (read-only here; the API doesn't expose endpoints to manage them) ---

export interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

// --- Classes ---

export interface Class {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClassDto {
  name: string;
}

export type UpdateClassDto = Partial<CreateClassDto>;

export const classesApi = resourceClient<Class, CreateClassDto, UpdateClassDto>('/classes');

// --- Subjects ---

export interface Subject {
  id: number;
  name: string;
  description: string | null;
  owner: Teacher;
  created_at: string;
  updated_at: string;
}

export interface CreateSubjectDto {
  name: string;
  description?: string;
  /** ID of the teacher who owns (and can delete) the subject. */
  ownerId: string;
}

export type UpdateSubjectDto = Partial<CreateSubjectDto>;

export const subjectsApi = resourceClient<Subject, CreateSubjectDto, UpdateSubjectDto>(
  '/subjects',
);

// --- Lessons ---

export interface Lesson {
  id: number;
  name: string | null;
  real_name: string;
  class: Class;
  teacher: Teacher;
  subject: Subject;
  created_at: string;
  updated_at: string;
}

export interface CreateLessonDto {
  name?: string;
  classId: number;
  teacherId: string;
  subjectId: number;
}

export type UpdateLessonDto = Partial<CreateLessonDto>;

export const lessonsApi = resourceClient<Lesson, CreateLessonDto, UpdateLessonDto>('/lessons');

// --- Assignments ---

export interface Assignment {
  id: number;
  title: string;
  begin_date: string | null;
  end_date: string | null;
  scale: number;
  coefficient: number;
  lesson: Lesson;
  created_at: string;
  updated_at: string;
}

export interface CreateAssignmentDto {
  title: string;
  begin_date?: string;
  end_date?: string;
  scale: number;
  coefficient?: number;
  lessonId: number;
}

export type UpdateAssignmentDto = Partial<CreateAssignmentDto>;

export const assignmentsApi = resourceClient<Assignment, CreateAssignmentDto, UpdateAssignmentDto>(
  '/assignments',
);

// --- Grades ---

export interface Grade {
  id: number;
  value: number;
  comment: string | null;
  assignment: Assignment;
  student: Student;
  created_at: string;
  updated_at: string;
}

export interface CreateGradeDto {
  value: number;
  comment?: string;
  assignmentId: number;
  studentId: string;
}

export type UpdateGradeDto = Partial<CreateGradeDto>;

export const gradesApi = resourceClient<Grade, CreateGradeDto, UpdateGradeDto>('/grades');
