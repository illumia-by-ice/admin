export interface UserPassword {
    id: number;
    uuid: string;
    content: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
  }
  
  export interface UserData {
    uuid: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    skills: string | null;
    bio: string;
    gender: string | null;
    type: string; // Adjust for other possible types
    root: boolean;
    authProvider: string; // Adjust for other providers
    verified: boolean;
    fileId: string;
    govtFileId: string;
    keyId: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    businessInfoId: string;
    subscriptionId: string;
    restrictionid: string | null;
    password: UserPassword;
  }
  