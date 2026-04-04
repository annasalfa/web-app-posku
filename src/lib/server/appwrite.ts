import 'server-only';

import {Account, Client, Databases, Users} from 'node-appwrite';

import {getServerEnv} from '@/lib/server/env';

function createBaseClient() {
  const serverEnv = getServerEnv();

  return new Client().setEndpoint(serverEnv.endpoint).setProject(serverEnv.projectId);
}

export function createAdminClient() {
  const client = createBaseClient().setKey(getServerEnv().apiKey);

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
    users: new Users(client),
  };
}

export function createSessionClient(sessionSecret: string) {
  const client = createBaseClient().setSession(sessionSecret);

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
  };
}
