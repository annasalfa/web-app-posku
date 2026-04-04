import {Account, Client} from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

export function createBrowserClient() {
  if (!endpoint || !project) {
    return null;
  }

  return new Client().setEndpoint(endpoint).setProject(project);
}

export function createAccountClient() {
  const client = createBrowserClient();

  if (!client) {
    return null;
  }

  return new Account(client);
}
