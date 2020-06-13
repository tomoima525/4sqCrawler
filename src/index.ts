import getVenues from './getVenues';
import getSingleVenue from './getSingleVenue';
import parseVenue from './parseVenue';
import fs from 'fs';
console.log('Start fetching data');

const queryParams = [`categoryId=4bf58dd8d48988d16c941735`, `radius=100000`, `limit=50`, `near=Chicago`].join('&');

const fileName = 'test.csv';
const header =
  'id, name, address, lat, lng, postalCode, city, state, country, cc, categoryId, categoryName, primary, bestPhoto, rating, tips, createdAt\n';
fs.appendFile(fileName, header, (err) => {
  if (err) {
    console.log('Failed with exception', err);
    throw err;
  }
  console.log('File created: ', fileName);
});

getVenues(queryParams).then((venues) => {
  Promise.all(
    venues.map((venue) => {
      return getSingleVenue(venue.id);
    })
  ).then((venueDetails) => {
    venueDetails
      .sort((a, b) => b.rating - a.rating)
      .forEach((venueDetail) => {
        fs.appendFileSync(fileName, `${parseVenue(venueDetail)}\n`);
      });
  });
});
