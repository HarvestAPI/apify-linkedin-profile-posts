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

interface Input {
  postedLimit: '24h' | 'week' | 'month';
  page?: string;
  scrapePages?: string;
  maxPosts: number | string;
  profileUrls?: string[];
  profilePublicIdentifiers?: string[];
  profileIds?: string[];
  companyUrls?: string[];
  companyPublicIdentifiers?: string[];
  companyIds?: string[];
}
// Structure of input is defined in input_schema.json
const input = await Actor.getInput<Input>();
if (!input) throw new Error('Input is missing!');

const profiles = [
  ...(input.profileUrls || []).map((url) => ({ profilePublicIdentifier: url })),
  ...(input.profilePublicIdentifiers || []).map((profilePublicIdentifier) => ({
    profilePublicIdentifier,
  })),
  ...(input.profileIds || []).map((profileId) => ({ profileId })),
];
const companies = [
  ...(input.companyUrls || []).map((url) => ({ companyUniversalName: url })),
  ...(input.companyPublicIdentifiers || []).map((companyUniversalName) => ({
    companyUniversalName,
  })),
  ...(input.companyIds || []).map((companyId) => ({ companyId })),
];

const scraper = createHarvestApiScraper({
  concurrency: 3,
});

const promisesProfiles = profiles.map((profile, index) => {
  return scraper.addJob({
    profile,
    company: null,
    params: {
      postedLimit: input.postedLimit,
      sortBy: 'date',
      page: input.page || '1',
    },
    scrapePages: Number(input.scrapePages),
    maxPosts: input.maxPosts === 0 || input.maxPosts === '0' ? 0 : Number(input.maxPosts) || null,
    index,
    total: profiles.length,
  });
});

const promisesCompanies = companies.map((company, index) => {
  return scraper.addJob({
    company,
    profile: null,
    params: {
      postedLimit: input.postedLimit,
      sortBy: 'date',
      page: input.page || '1',
    },
    maxPosts: input.maxPosts === 0 || input.maxPosts === '0' ? 0 : Number(input.maxPosts) || null,
    scrapePages: Number(input.scrapePages),
    index,
    total: companies.length,
  });
});

await Promise.all([...promisesProfiles, ...promisesCompanies]).catch((error) => {
  console.error(`Error scraping profiles:`, error);
});

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit();
