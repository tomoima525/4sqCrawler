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

async function venuesFromCategory(resultDir: string, near: string, categoryId: string): Promise<string> {
  const queryParams = [`categoryId=${categoryId}`, `radius=100000`, `limit=20`, `near=${near}`].join('&');
  const tempFile = `${resultDir}/${near}_${categoryId}`;
  await getVenues(queryParams).then(async (venues) => {
    return Promise.all(
      venues.map((venue) => {
        return getSingleVenue(venue.id);
      })
    ).then((venueDetails) => {
      const files = venueDetails
        .filter((result) => isVenueDetail(result))
        .sort((a, b) => (<VenueDetail>b).rating - (<VenueDetail>a).rating)
        .map((venueDetail) => {
          fs.appendFileSync(tempFile, `${parseVenue(<VenueDetail>venueDetail)},${near}\n`);
        });
      return files;
    });
  });
  return tempFile;
}

async function consolidateFiles(files: string[], mainFileName: string) {
  return Promise.all(files.map((file) => fs.readFileSync(file, 'utf-8')))
    .then((results) => fs.writeFileSync(mainFileName, results.join('\n')))
    .finally(() => {
      console.log('Generated ', mainFileName);
      files.map((file) => fs.unlinkSync(file));
    });
}

async function generateShopList(resultDir: string, near: string, categories: any) {
  const header =
    'id, name, address, lat, lng, postalCode, city, state, country, cc, categoryId, categoryName, primary, bestPhoto, rating, tips, createdAt, near\n';
  const fileName = `${resultDir}/result_${near.replace(' ', '_')}.csv`;

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
  for (const name of cities.names) {
    console.log(`Generate shop list for ${name}`);
    await generateShopList('result', name, categories);
    await wait(60000);
  }
}

generateLists();
