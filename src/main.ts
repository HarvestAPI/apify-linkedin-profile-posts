// Apify SDK - toolkit for building Apify Actors (Read more at https://docs.apify.com/sdk/js/).
import { Actor } from 'apify';
import { config } from 'dotenv';
import { createHarvestApiScraper } from './utils/scraper.js';

config();

// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
// import { router } from './routes.js';

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init().
await Actor.init();

export interface Input {
  postedLimit: '24h' | 'week' | 'month';
  page?: string;
  scrapePages?: string;
  maxPosts: number | string;
  targetUrls?: string[];
  profileUrls?: string[];
  profilePublicIdentifiers?: string[];
  profileIds?: string[];
  companyUrls?: string[];
  companyPublicIdentifiers?: string[];
  companyIds?: string[];
  authorsCompanies?: string[];
  authorsCompanyUrls?: string[];
  authorsCompanyPublicIdentifiers?: string[];
  authorsCompanyIds?: string[];

  scrapeReactions?: boolean;
  maxReactions?: number;
  scrapeComments?: boolean;
  maxComments?: number;
  commentsPostedLimit?: 'any' | '24h' | 'week' | 'month';
}
// Structure of input is defined in input_schema.json
const input = await Actor.getInput<Input>();
if (!input) throw new Error('Input is missing!');
const originalInput = JSON.parse(JSON.stringify(input)); // deep copy to avoid mutation

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
const authorsCompanies = [
  ...(input.authorsCompanyPublicIdentifiers || []).map((url) => ({
    authorsCompanyUniversalName: url,
  })),
  ...(input.authorsCompanyIds || []).map((authorsCompanyId) => ({
    authorsCompanyId,
  })),
  ...(input.authorsCompanyUrls || []).map((url) => ({ authorsCompanyUniversalName: url })),
  ...(input.authorsCompanies || []).map((authorsCompany) => ({ authorsCompany })),
];
const targets = [...(input.targetUrls || []).map((url) => ({ targetUrl: url }))];

const { actorMaxPaidDatasetItems } = Actor.getEnv();

export type ScraperState = {
  itemsLeft: number;
  datasetLastPushPromise?: Promise<any>;
};
const state: ScraperState = {
  itemsLeft: actorMaxPaidDatasetItems || 1000000,
};

const scraper = await createHarvestApiScraper({
  concurrency: 6,
  state,
  input,
  reactionsConcurrency: 2,
  originalInput,
});

const commonArgs = {
  scrapePages: Number(input.scrapePages),
  maxPosts: input.maxPosts === 0 || input.maxPosts === '0' ? 0 : Number(input.maxPosts) || null,
  total: profiles.length + companies.length + authorsCompanies.length + targets.length,
};

const promises = [
  ...[...profiles, ...companies, ...authorsCompanies, ...targets].map((profile) => {
    return scraper.addJob({
      entity: profile,
      params: {
        postedLimit: input.postedLimit,
        sortBy: 'date',
        page: input.page || '1',
      },
      ...commonArgs,
    });
  }),
];

await Promise.all(promises).catch((error) => {
  console.error(`Error scraping profiles:`, error);
});

await state.datasetLastPushPromise;

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit();
