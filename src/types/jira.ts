export interface JiraCredentials {
  email: string;
  apiToken: string;
  domain: string;
}

export interface JiraIssueType {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  subtask: boolean;
}

export interface JiraComponent {
  id: string;
  name: string;
  description?: string;
  lead?: {
    self: string;
    key: string;
    accountId: string;
    displayName: string;
  };
}

export interface JiraVersion {
  id: string;
  name: string;
  description?: string;
  archived: boolean;
  released: boolean;
  releaseDate?: string;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  properties: Record<string, unknown>;
  entityId: string;
  uuid: string;
  description?: string;
  lead?: {
    self: string;
    key: string;
    accountId: string;
    accountType: string;
    name: string;
    avatarUrls: Record<string, string>;
    displayName: string;
    active: boolean;
  };
  components: JiraComponent[];
  issueTypes: JiraIssueType[];
  url: string;
  email: string;
  assigneeType: string;
  versions: JiraVersion[];
  roles: Record<string, string>;
  avatarUrls: Record<string, string>;
  projectCategory?: {
    self: string;
    id: string;
    name: string;
    description: string;
  };
  insight?: {
    totalIssueCount: number;
    lastIssueUpdateTime: string;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  credentials: JiraCredentials | null;
  loading: boolean;
  error: string | null;
}