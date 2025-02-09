const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MAX_CACHE_SIZE = process.env.MAX_CACHE_SIZE || 2;
const cache = new Map();

const checkCacheSize = (req, res, next) => {
  if (req.method === "POST" && cache.size >= MAX_CACHE_SIZE) {
    return res.status(400).json({
      error: "Cache is full",
      maxSize: MAX_CACHE_SIZE,
      currentSize: cache.size,
    });
  }
  next();
};

app.use(checkCacheSize);

app.post("/cache", (req, res) => {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({
      error: "Both key and value are required",
    });
  }

  cache.set(key, value);

  res.status(201).json({
    message: "Cached successfully",
    key,
    value,
    cacheSize: cache.size,
  });
});

app.get("/cache/:key", (req, res) => {
  const { key } = req.params;

  if (!cache.has(key)) {
    return res.status(404).json({
      error: "Key not found",
    });
  }

  res.json({
    key,
    value: cache.get(key),
  });
});

app.delete("/cache/:key", (req, res) => {
  const { key } = req.params;

  if (!cache.has(key)) {
    return res.status(404).json({
      error: "Key not found",
    });
  }

  cache.delete(key);

  res.json({
    message: "Deleted successfully",
    key,
    cacheSize: cache.size,
  });
});

app.listen(port, () => {
  console.log(`Cache API running on port ${port}`);
});
