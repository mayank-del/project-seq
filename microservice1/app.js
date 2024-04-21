const express = require("express");
const axios = require("axios");
const redis = require("redis");

const app = express();
const port = process.env.PORT || 3000;

let redisClient;

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

async function fetchApiData(id) {
  const apiResponse = await axios.get(
    `https://dummyjson.com/todos/${id}`
  );
  console.log(apiResponse.data);
  return apiResponse.data;
}

async function getSpeciesData(req, res) {
  const id = req.params.id;
  let results;
  let isCached = false;

  try {
    const cacheResults = await redisClient.get(id);
    if (cacheResults) {
      isCached = true;
      results = JSON.parse(cacheResults);
    } else {
      results = await fetchApiData(id);
      if (results.length === 0) {
        throw "API returned an empty array";
      }
      await redisClient.set(id, JSON.stringify(results));
    }

    res.send({
      fromCache: isCached,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
}

app.get("/todos/:id", getSpeciesData);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});