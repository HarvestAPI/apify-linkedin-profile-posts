import { Actor } from 'apify';
import { createConcurrentQueues } from './queue.js';

const MAX_SCRAPED_ITEMS = 1000;

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
        params,
        scrapePages,
        total,
      }: {
        profile: { url?: string; publicIdentifier?: string; profileId?: string };
        params: Record<string, string>;
        scrapePages: number;
        index: number;
        total: number;
      }) => {
        if (processedPostsCounter >= MAX_SCRAPED_ITEMS) {
          console.warn(`Max scraped items reached: ${MAX_SCRAPED_ITEMS}`);
          return;
        }

        let profileId = profile.profileId;
        if (!profileId) {
          console.info(`Fetching profileId for ${JSON.stringify(profile)}...`);
          const queryParams = new URLSearchParams({ ...profile });

          const response = await fetch(
            `https://api.harvest-api.com/linkedin/profile-id?${queryParams.toString()}`,
            {
              headers: { 'X-API-Key': process.env.HARVESTAPI_TOKEN! },
            },
          )
            .then((response) => response.json())
            .catch((error) => {
              console.error(`Error fetching profile-id:`, error);
              return { error };
            });

          profileId = response.element?.id;
        }

        if (!profileId) {
          console.error(`No profileId found for ${JSON.stringify(profile)}`);
          return;
        } else {
          console.info(`Found profileId ${profileId} for ${JSON.stringify(profile)}`);
        }

        console.info(`Fetching posts for ${JSON.stringify(profile)}...`);
        const timestamp = new Date();
        let postsCounter = 0;

        const startPage = Number(params.page) || 1;
        const endPage = startPage + (scrapePages || 1);

        for (let i = startPage; i < endPage; i++) {
          if (processedPostsCounter >= MAX_SCRAPED_ITEMS) {
            console.warn(`Max scraped items reached: ${MAX_SCRAPED_ITEMS}`);
            break;
          }
          let postsOnPageCounter = 0;

          const queryParams = new URLSearchParams({
            ...params,
            profileId,
            page: String(i),
          });

          const response = await fetch(
            `https://api.harvest-api.com/linkedin/post-search?${queryParams.toString()}`,
            {
              headers: { 'X-API-Key': process.env.HARVESTAPI_TOKEN! },
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

              if (post.id) {
                scrapedPostsPerProfile[profileId] = scrapedPostsPerProfile[profileId] || {};
                if (!scrapedPostsPerProfile[profileId][post.id]) {
                  scrapedPostsPerProfile[profileId][post.id] = true;
                  processedPostsCounter++;
                  postsCounter++;
                  postsOnPageCounter++;
                  console.info(`Scraped post id ${post.id} for ${JSON.stringify(profile)}`);
                  await Actor.pushData(post);
                }
              }
            }
          } else {
            console.error(
              `Error scraping item#${index + 1} ${JSON.stringify(profile)}: ${JSON.stringify(
                typeof response.error === 'object' ? response.error : response,
                null,
                2,
              )}`,
            );
          }

          if (postsOnPageCounter === 0) {
            break;
          }
        }

        const elapsed = new Date().getTime() - timestamp.getTime();
        processedProfilesCounter++;

        console.info(
          `Scraped posts for ${JSON.stringify(profile)}. Posts found ${postsCounter} Elapsed: ${(
            elapsed / 1000
          ).toFixed(2)}s. Progress: ${processedProfilesCounter}/${total}`,
        );
      },
    ),
  };
}
