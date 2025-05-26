import { Actor } from 'apify';
import { Input, ScraperState } from '../main.js';
import { createLinkedinScraper } from '@harvestapi/scraper';

const { actorId, actorRunId, actorBuildId, userId, actorMaxPaidDatasetItems, memoryMbytes } =
  Actor.getEnv();

export async function scrapeCommentsForPost({
  post,
  state,
  input,
  concurrency,
}: {
  input: Input;
  post: { id: string; linkedinUrl: string };
  state: ScraperState;
  concurrency: number;
}): Promise<{
  comments: any[];
}> {
  if (!input.scrapeComments || state.itemsLeft <= 0) {
    return { comments: [] };
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

  let itemsCounter = 0;
  let maxComments = input.maxComments || 1000000;
  if (maxComments > state.itemsLeft) {
    maxComments = state.itemsLeft;
  }
  const comments: any[] = [];

  await scraperLib.scrapePostComments({
    query: {
      post: post.linkedinUrl || post.id,
    },
    outputType: 'callback',
    onItemScraped: async ({ item }) => {
      if (!item.id) return;
      itemsCounter++;
      delete (item as any).postId;
      (item as any).postId = post.id;

      console.info(`Scraped comment ${itemsCounter} for post ${post.id}`);

      comments.push(item);
      state.datasetLastPushPromise = Actor.pushData({
        type: 'comment',
        ...(item as any),
      });
    },
    overrideConcurrency: concurrency,
    maxItems: maxComments,
    disableLog: true,
  });

  state.itemsLeft -= itemsCounter;

  return { comments };
}
