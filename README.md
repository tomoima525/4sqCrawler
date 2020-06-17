A tool to fetch data from foursquare into csv file

### Install

```
yarn install
```

setup .env file

```
touch .env
vi .env

// .env
CLIENT_ID=xxx  // foursquare client id
CLIENT_KEY=xxx // foursquare client key 
```

setup result dir

```
mkdir result
```

### Usage

```
yarn start --citiesFile inputs/cities.json --categoriesFile inputs/categories.json 
```

output will be result_{number}_{cityname}.csv