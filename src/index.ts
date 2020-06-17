import getVenues from './getVenues';
import getSingleVenue from './getSingleVenue';
import parseVenue from './parseVenue';
import fs from 'fs';
import yargs from 'yargs';

import type { Empty, VenueDetail } from './types';

console.log('Start fetching data');
const { argv } = yargs.options({
  citiesFile: {
    demandOption: true,
    describe: 'file path to the city list in csv',
    type: 'string'
  },
  categoriesFile: {
    demandOption: true,
    describe: 'file path to the category list in csv',
    type: 'string'
  }
});

const { citiesFile, categoriesFile } = argv;
if (!fs.existsSync(citiesFile) || !fs.existsSync(categoriesFile)) {
  throw Error('cities and categories are required');
}

const cities = JSON.parse(fs.readFileSync(citiesFile, 'utf-8'));
const categories = JSON.parse(fs.readFileSync(categoriesFile, 'utf-8'));

function isVenueDetail(value: VenueDetail | Empty) {
  return value !== undefined;
}

async function venuesFromCategory(
  resultDir: string,
  near: string,
  category: { id: string; name: string }
): Promise<string> {
  const queryParams = [`categoryId=${category.id}`, `radius=10000`, `limit=22`, `near=${near}`].join('&');
  const tempFile = `${resultDir}/${near}_${category.name}`;
  await getVenues(queryParams).then(async (venues) => {
    if (!venues) return;
    return Promise.all(
      venues.map((venue) => {
        return getSingleVenue(venue.id);
      })
    ).then((venueDetails) => {
      const files = venueDetails
        .filter((result) => isVenueDetail(result))
        .sort((a, b) => (<VenueDetail>b).rating - (<VenueDetail>a).rating)
        .map((venueDetail) => {
          const parsedVenue = parseVenue(<VenueDetail>venueDetail);
          if (parsedVenue !== '') {
            fs.appendFileSync(tempFile, `${parsedVenue},${near},${category.name},"${category.id}"\n`);
          }
        });
      return files;
    });
  });

  if (!fs.existsSync(tempFile)) {
    fs.appendFileSync(tempFile, '');
  }
  return tempFile;
}

async function consolidateFiles(files: string[], mainFileName: string) {
  return Promise.all(files.map((file) => fs.readFileSync(file, 'utf-8')))
    .then((results) => fs.appendFileSync(mainFileName, results.join('')))
    .finally(() => {
      console.log('Generated ', mainFileName);
    });
}

async function generateShopList(resultDir: string, near: string, rank: string, categories: any) {
  const header =
    'id, name, address, lat, lng, postalCode, city, state, country, cc, categoryId, categoryName, primary, bestPhoto, rating, ratingSignals, tips, createdAt, near, chompCategoryName, seachedCategoryId\n';
  const fileName = `${resultDir}/result_${rank}_${near.replace(' ', '_')}.csv`;

  fs.appendFileSync(fileName, header);

  const files: string[] = [];

  for (let i = 0; i < categories.ids.length; i++) {
    if (i % 2 === 0) await wait(60000);
    const tempFile = await venuesFromCategory(resultDir, near, categories.ids[i]);
    files.push(tempFile);
  }
  console.log('=== temp files:', files);

  await consolidateFiles(files, fileName);
}

async function wait(sleep: number) {
  return new Promise((resolve) => {
    return setTimeout(() => {
      console.log(`wait ${sleep}`);
      resolve(true);
    }, sleep);
  });
}

async function generateLists() {
  for (const data of cities.names) {
    console.log(`Generate shop list for ${data.name}`);
    await generateShopList('result', data.name, data.rank, categories);
    await wait(60000);
  }
}

generateLists();
