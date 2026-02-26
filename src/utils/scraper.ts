import { ApiItemResponse, ApiListResponse, PostShort } from '@harvestapi/scraper';
import { Actor, ActorPricingInfo } from 'apify';
import { subMonths } from 'date-fns';
import { config } from 'dotenv';
import { Input, ScraperState } from '../main.js';
import { scrapeCommentsForPost } from './comments.js';
import { createConcurrentQueues } from './queue.js';
import { scrapeReactionsForPost } from './reactions.js';

config();

const { actorId, actorRunId, actorBuildId, userId, actorMaxPaidDatasetItems, memoryMbytes } =
  Actor.getEnv();

const pushPostData = createConcurrentQueues(
  100,
  async ({ item, pricingInfo }: { item: Record<string, any>; pricingInfo: ActorPricingInfo }) => {
    if (pricingInfo.isPayPerEvent) {
      await Actor.pushData(
        {
          ...item,
        },
        'post',
      );
    } else {
      await Actor.pushData({
        ...item,
      });
    }
  },
);

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
  const scrapedPostsPerProfile: Record<string, Record<string, boolean>> = {};
  const cm = Actor.getChargingManager();
  const pricingInfo = cm.getPricingInfo();
  const isPaying = !!process.env.APIFY_USER_IS_PAYING;

  let maxDate: Date | null = null;
  if (input.postedLimit === '1h') {
    maxDate = new Date(Date.now() - 1 * 60 * 60 * 1000);
  } else if (input.postedLimit === '24h') {
    maxDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  } else if (input.postedLimit === 'week') {
    maxDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (input.postedLimit === 'month') {
    maxDate = subMonths(new Date(), 1);
  } else if (input.postedLimit === '3months') {
    maxDate = subMonths(new Date(), 3);
  } else if (input.postedLimit === '6months') {
    maxDate = subMonths(new Date(), 6);
  } else if (input.postedLimit === 'year') {
    maxDate = subMonths(new Date(), 12);
  }

  let emptyQueryCounter = 0;
  const chargedPerEmptyBatch: Record<string, boolean> = {};

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
      }): Promise<{
        hasCharged: boolean;
        postsCounter: number;
      }> => {
        let hasCharged = false;
        let postsCounter = 0;

        if (state.itemsLeft <= 0) {
          console.warn(`Max scraped items reached: ${actorMaxPaidDatasetItems}`);
          return { hasCharged, postsCounter };
        }
        if (!entity) {
          console.error(`No profile or company provided`);
          return { hasCharged, postsCounter };
        }
        const entityKey = JSON.stringify(entity);
        let maxDateReached = false;
        let paginationToken: string | undefined | null = null;

        console.info(`Fetching posts for ${entityKey}...`);
        // const timestamp = new Date();

        const startPage = Number(params.page) || 1;
        const endPage = typeof maxPosts === 'number' ? 200 : startPage + (Number(scrapePages) || 1);

        for (let i = startPage; i < endPage; i++) {
          if (state.itemsLeft <= 0) {
            console.warn(`Max scraped items reached: ${actorMaxPaidDatasetItems}`);
            return { hasCharged, postsCounter };
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
            ...(paginationToken ? { paginationToken } : {}),
            page: String(i),
          });

          let apiPath = 'linkedin/profile-posts';
          if (
            entity.targetUrl &&
            (entity.targetUrl.includes('linkedin.com/posts/') ||
              entity.targetUrl.includes('linkedin.com/feed/update/'))
          ) {
            apiPath = 'linkedin/post';
          }

          const response: ApiListResponse<PostShort> = await fetch(
            `${process.env.HARVESTAPI_URL || 'https://api.harvest-api.com'}/${apiPath}?${queryParams.toString()}`,
            {
              headers: {
                'X-API-Key': process.env.HARVESTAPI_TOKEN!,
                'x-apify-userid': userId!,
                'x-apify-actor-id': actorId!,
                'x-apify-actor-run-id': actorRunId!,
                'x-apify-actor-build-id': actorBuildId!,
                'x-apify-memory-mbytes': String(memoryMbytes),
                'x-apify-actor-max-paid-dataset-items': String(actorMaxPaidDatasetItems) || '0',
                'x-apify-user-id': userId!,
                'x-apify-user-is-paying': String(isPaying),
                'x-apify-user-is-paying-2': process.env.APIFY_USER_IS_PAYING || '',
                'x-apify-is-pay-per-event': String(pricingInfo.isPayPerEvent),
              },
            },
          )
            .then((response) => response.json())
            .catch((error) => {
              console.error(`Error fetching posts:`, error);
              return {};
            });
          if (response?.cost) {
            hasCharged = true;
          }

          paginationToken = response?.pagination?.paginationToken;

          if (!response.elements && (response as any as ApiItemResponse<PostShort>).element) {
            response.elements = [(response as any as ApiItemResponse<PostShort>).element];
          }

          if (response.elements && response.status < 400) {
            const postPushPromises: Promise<void>[] = [];

            for (const post of response.elements) {
              if (!post.id) {
                console.warn(
                  `Post without ID found, skipping. Entity: ${entityKey}, post: ${JSON.stringify(post)}`,
                );
                continue;
              }
              if (state.itemsLeft <= 0) {
                console.warn(`Max scraped items reached: ${actorMaxPaidDatasetItems}`);
                return { hasCharged, postsCounter };
              }
              if (maxPosts && postsCounter >= maxPosts) {
                break;
              }
              const postPostedDateTimestamp = ((post as any)?.repostedAt || post?.postedAt)
                ?.timestamp;
              const postPostedDate = postPostedDateTimestamp
                ? new Date(postPostedDateTimestamp)
                : null;

              if (maxDate && postPostedDate) {
                if (maxDate.getTime() > postPostedDate.getTime()) {
                  maxDateReached = true;
                  continue;
                }
              }

              if (input.includeReposts === false && post.repostedBy) {
                continue;
              }
              if (input.includeQuotePosts === false && post.repost) {
                continue;
              }

              scrapedPostsPerProfile[entityKey] = scrapedPostsPerProfile[entityKey] || {};
              if (!scrapedPostsPerProfile[entityKey][post.id]) {
                scrapedPostsPerProfile[entityKey][post.id] = true;
                state.scrapedItemsCount++;
                postsCounter++;
                postsOnPageCounter++;
                state.itemsLeft -= 1;
                console.info(
                  `Scraped post #${state.processedProfilesCounter}_${postsCounter} id:${post.id} for ${entityKey}`,
                );

                const { reactions } =
                  post?.engagement?.likes || post?.engagement?.reactions
                    ? await scrapeReactionsForPost({
                        post,
                        state,
                        input,
                        concurrency: reactionsConcurrency,
                        pricingInfo,
                      }).catch((error) => {
                        console.error(`Error scraping reactions for post ${post.id}:`, error);
                        return { reactions: [] };
                      })
                    : { reactions: [] };

                const { comments } = post?.engagement?.comments
                  ? await scrapeCommentsForPost({
                      post,
                      state,
                      input,
                      concurrency: reactionsConcurrency,
                      pricingInfo,
                    }).catch((error) => {
                      console.error(`Error scraping comments for post ${post.id}:`, error);
                      return { comments: [] };
                    })
                  : { comments: [] };

                const query = Object.fromEntries(queryParams);
                for (const key of Object.keys(query)) {
                  if (!query[key] || query[key] === 'undefined') {
                    delete query[key];
                  }
                }

                postPushPromises.push(
                  pushPostData({
                    item: {
                      type: 'post',
                      ...post,
                      reactions,
                      comments,
                      query,
                    },
                    pricingInfo,
                  }),
                );
              }
            }

            await Promise.all(postPushPromises);
          } else {
            const error:
              | string
              | {
                  status?: number;
                } = response.error;
            let errStatus: number | undefined = response.status;

            if (typeof error === 'object') {
              if (error.status) errStatus = error.status;
            }
            if (error !== 'No included data') {
              console.error(
                `Error scraping item#${state.scrapedItemsCount + 1} ${entityKey}: ${JSON.stringify(error, null, 2)}`,
              );
            }
            if (Array.isArray(error)) {
              const arrErrorStatus = error.find((err) => err.status)?.status;
              if (arrErrorStatus) errStatus = arrErrorStatus;
            }
            if (errStatus === 429) {
              hasCharged = false;
              break;
            }
          }

          if (postsOnPageCounter === 0) {
            break;
          }
        }

        // const elapsed = new Date().getTime() - timestamp.getTime();
        state.processedProfilesCounter++;

        console.info(
          `Scraped posts for ${entityKey}. Posts found ${postsCounter}. Progress: ${state.processedProfilesCounter}/${total}`,
        );

        if (hasCharged && postsCounter === 0) {
          emptyQueryCounter++;
        }

        const emptyQueryBatch = Math.floor(emptyQueryCounter / 50);
        if (emptyQueryBatch && !chargedPerEmptyBatch[String(emptyQueryBatch)]) {
          chargedPerEmptyBatch[String(emptyQueryBatch)] = true;

          if (pricingInfo.isPayPerEvent) {
            await Actor.charge({ eventName: 'no-result' });
          } else {
            await Actor.pushData({
              message: 'No posts found',
            });
          }
        }

        return { hasCharged, postsCounter };
      },
    ),
    chargedPerEmptyBatch,
  };
}
