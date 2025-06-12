import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate?: string;
  dueDate?: string;
  assignee?: string;
  tags: string[];
  subtasks: Subtask[];
  dependencies: string[];
  progress: number; // 0-1
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  color: string;
  tasks: string[];
  members: string[];
  createdAt: string;
  updatedAt: string;
}

interface TaskState {
  tasks: Task[];
  projects: Project[];
  currentProject: string | null;
  viewMode: 'list' | 'kanban' | 'calendar' | 'gantt';
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Project actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (projectId: string | null) => void;
  
  // View actions
  setViewMode: (mode: 'list' | 'kanban' | 'calendar' | 'gantt') => void;
}

const defaultProject: Project = {
  id: 'default',
  title: 'Personal Tasks',
  description: 'Your personal task workspace',
  color: '#3b82f6',
  tasks: [],
  members: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Design landing page mockups',
    description: 'Create high-fidelity mockups for the new landing page with focus on conversion optimization.',
    status: 'in-progress',
    priority: 'high',
    startDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'current-user',
    tags: ['design', 'ui/ux', 'landing'],
    subtasks: [
      { id: 'sub-1', title: 'Research competitor landing pages', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-2', title: 'Create wireframes', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-3', title: 'Design hero section', completed: false, createdAt: new Date().toISOString() },
    ],
    dependencies: [],
    progress: 0.6,
    projectId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Implement authentication system',
    description: 'Set up secure user authentication with email/password and social login options.',
    status: 'todo',
    priority: 'critical',
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'current-user',
    tags: ['backend', 'security', 'auth'],
    subtasks: [],
    dependencies: [],
    progress: 0,
    projectId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Write API documentation',
    description: 'Document all API endpoints with examples and response schemas.',
    status: 'review',
    priority: 'medium',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: 'current-user',
    tags: ['documentation', 'api'],
    subtasks: [
      { id: 'sub-4', title: 'Document authentication endpoints', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-5', title: 'Document task management endpoints', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-6', title: 'Add code examples', completed: false, createdAt: new Date().toISOString() },
    ],
    dependencies: ['2'],
    progress: 0.8,
    projectId: 'default',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: sampleTasks,
      projects: [defaultProject],
      currentProject: 'default',
      viewMode: 'list',

      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          tasks: [...state.tasks, newTask],
          projects: state.projects.map(project => 
            project.id === newTask.projectId
              ? { ...project, tasks: [...project.tasks, newTask.id] }
              : project
          )
        }));
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          )
        }));
      },

      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id),
          projects: state.projects.map(project => ({
            ...project,
            tasks: project.tasks.filter(taskId => taskId !== id)
          }))
        }));
      },

      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          projects: [...state.projects, newProject]
        }));
      },

      updateProject: (id, updates) => {
        set(state => ({
          projects: state.projects.map(project =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date().toISOString() }
              : project
          )
        }));
      },

      deleteProject: (id) => {
        set(state => ({
          projects: state.projects.filter(project => project.id !== id),
          tasks: state.tasks.filter(task => task.projectId !== id),
          currentProject: state.currentProject === id ? null : state.currentProject
        }));
      },

      setCurrentProject: (projectId) => {
        set({ currentProject: projectId });
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },
    }),
    {
      name: 'task-storage',
    }
  )
);