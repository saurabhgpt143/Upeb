// Firebase has been deactivated per user request.
// Safe stubs and local storage fallback are provided below.

export const db: any = null;
export const auth: any = { currentUser: null };
export const googleProvider: any = null;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.warn('Firebase is deactivated.', error);
}

export async function testFirestoreConnection() {
  // Firebase is deactivated; no network calls performed.
}

export async function signInWithGoogle() {
  return {
    uid: 'local_guest_user',
    displayName: 'Local User',
    email: 'local@user.app',
    emailVerified: true,
    isAnonymous: false,
    providerData: [],
  };
}

export async function signOutUser() {
  // No-op
}

export async function syncUserProfile(_user: any) {
  // No-op
}

export interface SavedProject {
  id: string;
  name: string;
  userId: string;
  specs: any;
  createdAt?: any;
  updatedAt?: any;
}

const LOCAL_STORAGE_KEY = 'upeb_local_saved_projects';

function getLocalProjects(): SavedProject[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    return [];
  }
}

function setLocalProjects(projects: SavedProject[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to write to local storage', err);
  }
}

export async function saveProject(projectId: string, name: string, specs: any, userId: string) {
  const projects = getLocalProjects();
  const index = projects.findIndex(p => p.id === projectId);
  const now = new Date().toISOString();
  const newProject: SavedProject = {
    id: projectId,
    name,
    userId: userId || 'local_guest_user',
    specs,
    updatedAt: now,
    createdAt: index >= 0 ? projects[index].createdAt : now,
  };

  if (index >= 0) {
    projects[index] = newProject;
  } else {
    projects.push(newProject);
  }
  setLocalProjects(projects);
  window.dispatchEvent(new Event('upeb_projects_changed'));
}

export async function deleteProject(projectId: string) {
  const projects = getLocalProjects().filter(p => p.id !== projectId);
  setLocalProjects(projects);
  window.dispatchEvent(new Event('upeb_projects_changed'));
}

export function subscribeUserProjects(_userId: string, onUpdate: (projects: SavedProject[]) => void) {
  const update = () => {
    onUpdate(getLocalProjects());
  };
  update();

  const listener = () => update();
  window.addEventListener('storage', listener);
  window.addEventListener('upeb_projects_changed', listener);

  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener('upeb_projects_changed', listener);
  };
}

