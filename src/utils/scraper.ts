import { Actor } from 'apify';
import { createConcurrentQueues } from './queue.js';
import { scrapeReactionsForPost } from './reactions.js';
import { scrapeCommentsForPost } from './comments.js';
import { Input, ScraperState } from '../main.js';
import { config } from 'dotenv';

config();

const { actorId, actorRunId, actorBuildId, userId, actorMaxPaidDatasetItems, memoryMbytes } =
  Actor.getEnv();

export function createHarvestApiScraper({
  concurrency,
  reactionsConcurrency,
  state,
  input,
}: {
  state: ScraperState;
  input: Input;
  concurrency: number;
  reactionsConcurrency: number;
}) {
  let processedPostsCounter = 0;
  let processedProfilesCounter = 0;

  const scrapedPostsPerProfile: Record<string, Record<string, boolean>> = {};

  return {
    addJob: createConcurrentQueues(
      concurrency,
      async ({
        entity,
        params,
        scrapePages,
        maxPosts,
        total,
      }: {
        entity: {
          profilePublicIdentifier?: string;
          profileId?: string;
          companyUniversalName?: string;
          companyId?: string;
          authorsCompanyId?: string;
          authorsCompanyUniversalName?: string;
          authorsCompany?: string;
          targetUrl?: string;
        } | null;
        params: Record<string, string | string[]>;
        scrapePages: number;
        maxPosts: number | null;
        total: number;
      }) => {
        if (state.itemsLeft <= 0) {
          console.warn(`Max scraped items reached: ${actorMaxPaidDatasetItems}`);
          return;
        }
        if (!entity) {
          console.error(`No profile or company provided`);
          return;
        }
        const entityKey = JSON.stringify(entity);

        console.info(`Fetching posts for ${entityKey}...`);
        // const timestamp = new Date();
        let postsCounter = 0;

        const startPage = Number(params.page) || 1;
        const endPage = typeof maxPosts === 'number' ? 200 : startPage + (Number(scrapePages) || 1);

        for (let i = startPage; i < endPage; i++) {
          if (state.itemsLeft <= 0) {
            console.warn(`Max scraped items reached: ${actorMaxPaidDatasetItems}`);
            return;
          }
          if (maxPosts && postsCounter >= maxPosts) {
            break;
          }

          let postsOnPageCounter = 0;

          const queryParams = new URLSearchParams({
            ...params,
            ...entity,
            page: String(i),
          });

          const response = await fetch(
            `${process.env.HARVESTAPI_URL || 'https://api.harvest-api.com'}/linkedin/post-search?${queryParams.toString()}`,
            {
              headers: {
                'X-API-Key': process.env.HARVESTAPI_TOKEN!,
                'x-apify-userid': userId!,
                'x-apify-actor-id': actorId!,
                'x-apify-actor-run-id': actorRunId!,
                'x-apify-actor-build-id': actorBuildId!,
                'x-apify-memory-mbytes': String(memoryMbytes),
                'x-apify-actor-max-paid-dataset-items': String(actorMaxPaidDatasetItems) || '0',
              },
            },
          )
            .then((response) => response.json())
            .catch((error) => {
              console.error(`Error fetching posts:`, error);
              return {};
            });

          if (response.elements && response.status < 400) {
            for (const post of response.elements) {
              if (state.itemsLeft <= 0) {
                console.warn(`Max scraped items reached: ${actorMaxPaidDatasetItems}`);
                return;
              }
              if (maxPosts && postsCounter >= maxPosts) {
                break;
              }

              if (post.id) {
                scrapedPostsPerProfile[entityKey] = scrapedPostsPerProfile[entityKey] || {};
                if (!scrapedPostsPerProfile[entityKey][post.id]) {
                  scrapedPostsPerProfile[entityKey][post.id] = true;
                  processedPostsCounter++;
                  postsCounter++;
                  postsOnPageCounter++;
                  state.itemsLeft -= 1;
                  console.info(
                    `Scraped post #${processedProfilesCounter}_${postsCounter} id:${post.id} for ${entityKey}`,
                  );

                  const { reactions } = await scrapeReactionsForPost({
                    post,
                    state,
                    input,
                    concurrency: reactionsConcurrency,
                  }).catch((error) => {
                    console.error(`Error scraping reactions for post ${post.id}:`, error);
                    return { reactions: [] };
                  });

                  const { comments } = await scrapeCommentsForPost({
                    post,
                    state,
                    input,
                    concurrency: reactionsConcurrency,
                  }).catch((error) => {
                    console.error(`Error scraping comments for post ${post.id}:`, error);
                    return { comments: [] };
                  });

                  state.datasetLastPushPromise = Actor.pushData({
                    type: 'post',
                    ...post,
                    reactions,
                    comments,
                  });
                }
              }
            }
          } else {
            const error = typeof response.error === 'object' ? response.error : response;
            if (typeof error === 'object') {
              delete error.user;
              delete error.credits;
            }
            console.error(
              `Error scraping item#${processedPostsCounter + 1} ${entityKey}: ${JSON.stringify(error, null, 2)}`,
            );
          }

          if (postsOnPageCounter === 0) {
            break;
          }
        }

        // const elapsed = new Date().getTime() - timestamp.getTime();
        processedProfilesCounter++;

        console.info(
          `Scraped posts for ${entityKey}. Posts found ${postsCounter}. Progress: ${processedProfilesCounter}/${total}`,
        );
      },
    ),
  };
}
