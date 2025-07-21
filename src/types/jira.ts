export interface JiraCredentials {
  email: string;
  apiToken: string;
  domain: string;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  simplified: boolean;
  style: string;
  isPrivate: boolean;
  properties: Record<string, any>;
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
  components: any[];
  issueTypes: any[];
  url: string;
  email: string;
  assigneeType: string;
  versions: any[];
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