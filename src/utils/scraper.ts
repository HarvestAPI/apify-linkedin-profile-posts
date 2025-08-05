import { Actor } from 'apify';
import { config } from 'dotenv';
import { Input, ScraperState } from '../main.js';
import { scrapeCommentsForPost } from './comments.js';
import { createConcurrentQueues } from './queue.js';
import { scrapeReactionsForPost } from './reactions.js';

config();

const { actorId, actorRunId, actorBuildId, userId, actorMaxPaidDatasetItems, memoryMbytes } =
  Actor.getEnv();

const pushPostData = createConcurrentQueues(190, async (item: Record<string, any>) => {
  await Actor.pushData({
    ...item,
  });
});

export async function createHarvestApiScraper({
  concurrency,
  reactionsConcurrency,
  state,
  input,
}: {
  state: ScraperState;
  input: Input;
  concurrency: number;
  reactionsConcurrency: number;
  originalInput: Input;
}) {
  let processedPostsCounter = 0;
  let processedProfilesCounter = 0;

  const scrapedPostsPerProfile: Record<string, Record<string, boolean>> = {};
  const client = Actor.newClient();
  const user = userId ? await client.user(userId).get() : null;

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
        let maxDateReached = false;
        let paginationToken: string = '';

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
          if (maxDateReached) {
            break;
          }

          let postsOnPageCounter = 0;

          const queryParams = new URLSearchParams({
            ...params,
            ...entity,
            paginationToken,
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
                'x-apify-username': user?.username || '',
                'x-apify-user-is-paying': (user as Record<string, any> | null)?.isPaying,
              },
            },
          )
            .then((response) => response.json())
            .catch((error) => {
              console.error(`Error fetching posts:`, error);
              return {};
            });

          paginationToken = response?.pagination?.paginationToken;

          if (response.elements && response.status < 400) {
            for (const post of response.elements) {
              if (state.itemsLeft <= 0) {
                console.warn(`Max scraped items reached: ${actorMaxPaidDatasetItems}`);
                return;
              }
              if (maxPosts && postsCounter >= maxPosts) {
                break;
              }

              if (params.postedLimit) {
                let maxDate: Date | null = null;
                if (params.postedLimit === '24h') {
                  maxDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
                } else if (params.postedLimit === 'week') {
                  maxDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                } else if (params.postedLimit === 'month') {
                  maxDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                }

                const postPostedDate = post?.postedAt?.timestamp
                  ? new Date(post?.postedAt?.timestamp)
                  : null;

                if (maxDate && postPostedDate) {
                  if (maxDate.getTime() > postPostedDate.getTime()) {
                    maxDateReached = true;
                    continue;
                  }
                }
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
                    user,
                  }).catch((error) => {
                    console.error(`Error scraping reactions for post ${post.id}:`, error);
                    return { reactions: [] };
                  });

                  const { comments } = await scrapeCommentsForPost({
                    post,
                    state,
                    input,
                    concurrency: reactionsConcurrency,
                    user,
                  }).catch((error) => {
                    console.error(`Error scraping comments for post ${post.id}:`, error);
                    return { comments: [] };
                  });

                  const query = Object.fromEntries(queryParams);
                  for (const key of Object.keys(query)) {
                    if (!query[key] || query[key] === 'undefined') {
                      delete query[key];
                    }
                  }

                  await pushPostData({
                    type: 'post',
                    ...post,
                    reactions,
                    comments,
                    query,
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
