// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/).
import { Actor } from 'apify';
import { createHarvestApiScraper } from './utils/scraper.js';
import { config } from 'dotenv';

config();

// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
// import { router } from './routes.js';

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init().
await Actor.init();

// console.log(`userId:`, Actor.getEnv().userId);

interface Input {
  postedLimit: '24h' | 'week' | 'month';
  page: string;
  scrapePages: string;
  profileUrls?: string[];
  profilePublicIdentifiers?: string[];
  profileIds?: string[];
}
// Structure of input is defined in input_schema.json
const input = await Actor.getInput<Input>();
if (!input) throw new Error('Input is missing!');

const profiles = [
  ...(input.profileUrls || []).map((url) => ({ url })),
  ...(input.profilePublicIdentifiers || []).map((publicIdentifier) => ({ publicIdentifier })),
  ...(input.profileIds || []).map((profileId) => ({ profileId })),
];

const scraper = createHarvestApiScraper({
  concurrency: 3,
});

const promises = profiles.map((profile, index) => {
  return scraper.addJob({
    profile,
    params: {
      postedLimit: input.postedLimit,
      sortBy: 'date',
      page: input.page,
    },
    scrapePages: Number(input.scrapePages),
    index,
    total: profiles.length,
  });
});

await Promise.all(promises).catch((error) => {
  console.error(`Error scraping profiles:`, error);
});

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit();
