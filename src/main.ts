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
  authorsCompanyUrls?: string[];
  authorsCompanyUniversalName?: string[];
  authorsCompanyId?: string[];
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

const queryRest: {
  authorsCompanyUniversalName: string[];
  authorsCompanyId: string[];
} = {
  authorsCompanyUniversalName: [],
  authorsCompanyId: [],
};
(input.authorsCompanyUniversalName || []).forEach((companyUniversalName) => {
  queryRest.authorsCompanyUniversalName.push(companyUniversalName);
});
(input.authorsCompanyId || []).forEach((companyId) => {
  queryRest.authorsCompanyId.push(companyId);
});
(input.authorsCompanyUrls || []).forEach((url) => {
  queryRest.authorsCompanyUniversalName.push(url);
});

const scraper = createHarvestApiScraper({
  concurrency: 5,
});

const commonArgs = {
  scrapePages: Number(input.scrapePages),
  maxPosts: input.maxPosts === 0 || input.maxPosts === '0' ? 0 : Number(input.maxPosts) || null,
  total:
    profiles.length +
    companies.length +
    (queryRest.authorsCompanyId?.length || queryRest.authorsCompanyUniversalName?.length ? 1 : 0),
};

const promisesProfiles = profiles.map((profile) => {
  return scraper.addJob({
    entity: profile,
    params: {
      postedLimit: input.postedLimit,
      sortBy: 'date',
      page: input.page || '1',
      ...queryRest,
    },
    ...commonArgs,
  });
});

const promisesCompanies = companies.map((company) => {
  return scraper.addJob({
    entity: company,
    params: {
      postedLimit: input.postedLimit,
      sortBy: 'date',
      page: input.page || '1',
    },
    ...commonArgs,
  });
});

if (queryRest.authorsCompanyId?.length || queryRest.authorsCompanyUniversalName?.length) {
  promisesCompanies.push(
    scraper.addJob({
      entity: {
        authorsCompanyId: queryRest.authorsCompanyId.join(',') || undefined,
        authorsCompanyUniversalName: queryRest.authorsCompanyUniversalName.join(',') || undefined,
      },
      params: {
        postedLimit: input.postedLimit,
        sortBy: 'date',
        page: input.page || '1',
      },
      ...commonArgs,
    }),
  );
}

await Promise.all([...promisesProfiles, ...promisesCompanies]).catch((error) => {
  console.error(`Error scraping profiles:`, error);
});

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
await Actor.exit();
