const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the GitHub repo's root files, including index.html
app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

const clean = (value, max = 100) => {
  return String(value || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, max);
};

async function getJSON(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "SIGNALWEAVE/1.0"
    }
  });

  if (!response.ok) {
    throw new Error(`Upstream request failed: ${response.status}`);
  }

  return response.json();
}

app.get("/api/weave", async (req, res) => {
  const q = clean(req.query.q);

  if (!q) {
    return res.status(400).json({
      error: "Enter a signal."
    });
  }

  try {
    const wikipediaURL =
      "https://en.wikipedia.org/w/api.php" +
      "?action=query" +
      "&generator=search" +
      "&gsrsearch=" + encodeURIComponent(q) +
      "&gsrnamespace=0" +
      "&gsrlimit=8" +
      "&prop=extracts|pageimages" +
      "&exintro=1" +
      "&explaintext=1" +
      "&exchars=500" +
      "&piprop=thumbnail" +
      "&pithumbsize=360" +
      "&format=json" +
      "&origin=*";

    const itunesURL =
      "https://itunes.apple.com/search" +
      "?term=" + encodeURIComponent(q) +
      "&entity=album,song" +
      "&limit=8";

    const [wiki, music] = await Promise.all([
      getJSON(wikipediaURL),
      getJSON(itunesURL)
    ]);

    const wikipediaResults = Object.values(
      wiki.query?.pages || {}
    ).map(item => ({
      type: "REFERENCE",
      title: item.title || "Untitled",
      text: item.extract || "No abstract available.",
      url: item.pageid
        ? "https://en.wikipedia.org/?curid=" + item.pageid
        : "https://en.wikipedia.org/",
      image: item.thumbnail?.source || null,
      source: "WIKIPEDIA"
    }));

    const itunesResults = (music.results || []).map(item => ({
      type: item.kind === "song" ? "TRACK" : "RECORD",
      title:
        item.trackName ||
        item.collectionName ||
        "Untitled",
      text: [
        item.artistName,
        item.primaryGenreName
      ]
        .filter(Boolean)
        .join(" · "),
      url:
        item.trackViewUrl ||
        item.collectionViewUrl ||
        "#",
      image: item.artworkUrl100
        ? item.artworkUrl100.replace(
            "100x100",
            "400x400"
          )
        : null,
      source: "ITUNES"
    }));

    const signals = [
      ...wikipediaResults.slice(0, 6),
      ...itunesResults.slice(0, 6)
    ];

    return res.json({
      query: q,
      count: signals.length,
      signals
    });

  } catch (error) {
    console.error(
      "SIGNALWEAVE API ERROR:",
      error
    );

    return res.status(502).json({
      error: "The weave could not be retrieved.",
      detail: error.message
    });
  }
});

// Express 5-compatible fallback for the root-level index.html
app.get(/.*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "index.html")
  );
});

app.listen(PORT, () => {
  console.log(
    `SIGNALWEAVE running on port ${PORT}`
  );
});
