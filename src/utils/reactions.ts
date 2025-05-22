import { Actor } from 'apify';
import { Input } from '../main.js';
import { createLinkedinScraper } from '@harvestapi/scraper';

const { actorId, actorRunId, actorBuildId, userId, actorMaxPaidDatasetItems, memoryMbytes } =
  Actor.getEnv();

export async function scrapeReactionsForPost({
  post,
  state,
  input,
  concurrency,
}: {
  input: Input;
  post: { id: string; linkedinUrl: string };
  state: { itemsLeft: number };
  concurrency: number;
}): Promise<{
  reactions: any[];
}> {
  if (!input.scrapeReactions || state.itemsLeft <= 0) {
    return { reactions: [] };
  }

  const scraperLib = createLinkedinScraper({
    apiKey: process.env.HARVESTAPI_TOKEN!,
    baseUrl: process.env.HARVESTAPI_URL || 'https://api.harvest-api.com',
    addHeaders: {
      'x-apify-userid': userId!,
      'x-apify-actor-id': actorId!,
      'x-apify-actor-run-id': actorRunId!,
      'x-apify-actor-build-id': actorBuildId!,
      'x-apify-memory-mbytes': String(memoryMbytes),
      'x-apify-actor-max-paid-dataset-items': String(actorMaxPaidDatasetItems) || '0',
    },
  });

  let postReactionsCounter = 0;
  let maxReactions = input.maxReactions || 1000000;
  if (maxReactions > state.itemsLeft) {
    maxReactions = state.itemsLeft;
  }

  const reactions: any[] = [];

  await scraperLib.scrapePostReactions({
    query: {
      post: post.linkedinUrl || post.id,
    },
    outputType: 'callback',
    onItemScraped: async ({ item }) => {
      if (!item.id) return;
      postReactionsCounter++;
      delete (item as any).postId;
      (item as any).postId = post.id;

      console.info(`Scraped reaction ${postReactionsCounter} for post ${post.id}`);

      reactions.push(item);
      await Actor.pushData({
        type: 'reaction',
        ...item,
      });
    },
    overrideConcurrency: concurrency,
    maxItems: maxReactions,
    disableLog: true,
  });

  state.itemsLeft -= postReactionsCounter;

  return { reactions };
}
