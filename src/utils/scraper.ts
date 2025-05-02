import { Actor } from 'apify';
import { createConcurrentQueues } from './queue.js';

const MAX_SCRAPED_ITEMS = 1000;
const USER_ID = Actor.getEnv().userId;

export function createHarvestApiScraper({ concurrency }: { concurrency: number }) {
  let processedPostsCounter = 0;
  let processedProfilesCounter = 0;

  const scrapedPostsPerProfile: Record<string, Record<string, boolean>> = {};

  return {
    addJob: createConcurrentQueues(
      concurrency,
      async ({
        index,
        profile,
        company,
        params,
        scrapePages,
        maxPosts,
        total,
      }: {
        profile: {
          profilePublicIdentifier?: string;
          profileId?: string;
        } | null;
        company: {
          companyUniversalName?: string;
          companyId?: string;
        } | null;
        params: Record<string, string>;
        scrapePages: number;
        maxPosts: number | null;
        index: number;
        total: number;
      }) => {
        if (processedPostsCounter >= MAX_SCRAPED_ITEMS) {
          console.warn(`Max scraped items reached: ${MAX_SCRAPED_ITEMS}`);
          return;
        }
        const entity = profile || company;
        if (!entity) {
          console.error(`No profile or company provided`);
          return;
        }
        const entityKey = JSON.stringify(entity);

        console.info(`Fetching posts for ${entityKey}...`);
        const timestamp = new Date();
        let postsCounter = 0;

        const startPage = Number(params.page) || 1;
        const endPage = typeof maxPosts === 'number' ? 200 : startPage + (Number(scrapePages) || 1);

        for (let i = startPage; i < endPage; i++) {
          if (processedPostsCounter >= MAX_SCRAPED_ITEMS) {
            console.warn(`Max scraped items reached: ${MAX_SCRAPED_ITEMS}`);
            break;
          }
          let postsOnPageCounter = 0;

          const queryParams = new URLSearchParams({
            ...params,
            ...entity,
            page: String(i),
          });

          const response = await fetch(
            `https://api.harvest-api.com/linkedin/post-search?${queryParams.toString()}`,
            {
              headers: {
                'X-API-Key': process.env.HARVESTAPI_TOKEN!,
                'x-apify-userid': USER_ID!,
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
              if (processedPostsCounter >= MAX_SCRAPED_ITEMS) {
                console.warn(`Max scraped items reached: ${MAX_SCRAPED_ITEMS}`);
                break;
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
                  console.info(`Scraped post id ${post.id} for ${entityKey}`);
                  await Actor.pushData(post);
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
              `Error scraping item#${index + 1} ${entityKey}: ${JSON.stringify(error, null, 2)}`,
            );
          }

          if (postsOnPageCounter === 0) {
            break;
          }
        }

        const elapsed = new Date().getTime() - timestamp.getTime();
        processedProfilesCounter++;

        console.info(
          `Scraped posts for ${entityKey}. Posts found ${postsCounter} Elapsed: ${(
            elapsed / 1000
          ).toFixed(2)}s. Progress: ${processedProfilesCounter}/${total}`,
        );
      },
    ),
  };
}
