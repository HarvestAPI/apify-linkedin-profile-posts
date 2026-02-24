import { createLinkedinScraper } from '@harvestapi/scraper';
import { Actor, ActorPricingInfo } from 'apify';
import { Input, ScraperState } from '../main.js';

const { actorId, actorRunId, actorBuildId, userId, actorMaxPaidDatasetItems, memoryMbytes } =
  Actor.getEnv();
const isPaying = !!process.env.APIFY_USER_IS_PAYING;

export async function scrapeReactionsForPost({
  post,
  state,
  input,
  concurrency,
  pricingInfo,
}: {
  input: Input;
  post: { id: string; linkedinUrl: string };
  state: ScraperState;
  concurrency: number;
  pricingInfo: ActorPricingInfo;
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
      'x-apify-user-id': userId!,
      'x-apify-user-is-paying': String(isPaying),
      'x-apify-user-is-paying-2': process.env.APIFY_USER_IS_PAYING || '',
    },
  });

  let postReactionsCounter = 0;
  let maxReactions = input.maxReactions || 1000000;
  if (maxReactions > state.itemsLeft) {
    maxReactions = state.itemsLeft;
  }

  const reactions: any[] = [];
  const query = {
    post: post.linkedinUrl || post.id,
  };

  await scraperLib.scrapePostReactions({
    query,
    outputType: 'callback',
    onItemScraped: async ({ item }) => {
      if (!item.id) return;
      postReactionsCounter++;
      delete (item as any).postId;
      (item as any).postId = post.id;

      console.info(`Scraped reaction ${postReactionsCounter} for post ${post.id}`);

      reactions.push(item);

      if (pricingInfo.isPayPerEvent) {
        await Actor.pushData(
          {
            type: 'reaction',
            ...item,
            query,
          },
          'reaction',
        );
      } else {
        await Actor.pushData({
          type: 'reaction',
          ...item,
          query,
        });
      }
    },
    overrideConcurrency: concurrency,
    maxItems: maxReactions,
    disableLog: true,
  });

  state.itemsLeft -= postReactionsCounter;

  return { reactions };
}
