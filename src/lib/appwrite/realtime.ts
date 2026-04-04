import type {RealtimeResponseEvent} from 'appwrite';

import {createBrowserClient} from '@/lib/appwrite/client';

export function subscribeToChannels(
  channels: string[],
  callback: (event: RealtimeResponseEvent<unknown>) => void,
) {
  const client = createBrowserClient();

  if (!client) {
    return () => undefined;
  }

  return client.subscribe(channels, callback);
}
