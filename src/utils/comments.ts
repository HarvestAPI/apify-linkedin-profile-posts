import { Actor } from 'apify';
import { Input, ScraperState } from '../main.js';
import { createLinkedinScraper } from '@harvestapi/scraper';
import { User } from 'apify-client';
import { subMonths } from 'date-fns';

const { actorId, actorRunId, actorBuildId, userId, actorMaxPaidDatasetItems, memoryMbytes } =
  Actor.getEnv();

export async function scrapeCommentsForPost({
  post,
  state,
  input,
  concurrency,
  user,
}: {
  input: Input;
  post: { id: string; linkedinUrl: string };
  state: ScraperState;
  concurrency: number;
  user: User | null;
}): Promise<{
  comments: any[];
}> {
  if (!input.scrapeComments || state.itemsLeft <= 0) {
    return { comments: [] };
  }

  let maxDate: Date | null = null;
  if (input.commentsPostedLimit === '1h') {
    maxDate = new Date(Date.now() - 1 * 60 * 60 * 1000);
  } else if (input.commentsPostedLimit === '24h') {
    maxDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  } else if (input.commentsPostedLimit === 'week') {
    maxDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (input.commentsPostedLimit === 'month') {
    maxDate = subMonths(new Date(), 1);
  } else if (input.commentsPostedLimit === '3months') {
    maxDate = subMonths(new Date(), 3);
  } else if (input.commentsPostedLimit === '6months') {
    maxDate = subMonths(new Date(), 6);
  } else if (input.commentsPostedLimit === 'year') {
    maxDate = subMonths(new Date(), 12);
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
      'x-apify-username': user?.username || '',
      'x-apify-user-is-paying': (user as Record<string, any> | null)?.isPaying,
    },
  });

  let itemsCounter = 0;
  let maxComments = input.maxComments || 1000000;
  if (maxComments > state.itemsLeft) {
    maxComments = state.itemsLeft;
  }
  const comments: any[] = [];
  const query = {
    post: post.linkedinUrl || post.id,
  };

  await scraperLib.scrapePostComments({
    query: query,
    outputType: 'callback',
    onPageFetched: async ({ data }) => {
      if (data?.elements) {
        data.elements = data.elements.filter((item) => {
          if (maxDate && item?.createdAt) {
            const createdAt = new Date(item.createdAt);
            if (createdAt < maxDate) return false;
          }
          return true;
        });
      }
    },
    onItemScraped: async ({ item }) => {
      if (!item.id) return;
      itemsCounter++;
      delete (item as any).postId;
      (item as any).postId = post.id;

      console.info(`Scraped comment ${itemsCounter} for post ${post.id}`);

      comments.push(item);
      await Actor.pushData({
        type: 'comment',
        ...(item as any),
        query,
      });
    },
    overrideConcurrency: concurrency,
    maxItems: maxComments,
    disableLog: true,
  });

  state.itemsLeft -= itemsCounter;

  return { comments };
}
