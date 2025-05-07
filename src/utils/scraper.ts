import { Actor } from 'apify';
import { createConcurrentQueues } from './queue.js';

const USER_ID = Actor.getEnv().userId;

export function createHarvestApiScraper({ concurrency }: { concurrency: number }) {
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
        } | null;
        params: Record<string, string | string[]>;
        scrapePages: number;
        maxPosts: number | null;
        total: number;
      }) => {
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
              `Error scraping item#${processedPostsCounter + 1} ${entityKey}: ${JSON.stringify(error, null, 2)}`,
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
