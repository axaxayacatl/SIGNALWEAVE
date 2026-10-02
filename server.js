const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));

// Your current repository has index.html at the root.
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
    throw new Error(
      `Upstream request failed: ${response.status}`
    );
  }

  return response.json();
}


// ========================================
// SIGNALWEAVE API
// ========================================

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


    // ========================================
    // WIKIPEDIA
    // ========================================

    const wikipediaResults =
      Object.values(
        wiki.query?.pages || {}
      ).map(item => ({

        type: "REFERENCE",

        title:
          item.title ||
          "Untitled",

        text:
          item.extract ||
          "No abstract available.",

        url:
          "https://en.wikipedia.org/?curid=" +
          item.pageid,

        image:
          item.thumbnail?.source ||
          null,

        source:
          "WIKIPEDIA"

      }));


    // ========================================
    // ITUNES
    // ========================================

    const itunesResults =
      (music.results || []).map(item => ({

        type:
          item.kind === "song"
            ? "TRACK"
            : "RECORD",

        title:
          item.trackName ||
          item.collectionName ||
          "Untitled",

        text:
          [
            item.artistName,
            item.primaryGenreName
          ]
          .filter(Boolean)
          .join(" · "),

        url:
          item.trackViewUrl ||
          item.collectionViewUrl ||
          "#",

        image:
          item.artworkUrl100
            ? item.artworkUrl100.replace(
                "100x100",
                "400x400"
              )
            : null,

        source:
          "ITUNES"

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

  }

  catch (error) {

    console.error(
      "SIGNALWEAVE API ERROR:",
      error
    );

    return res.status(502).json({

      error:
        "The weave could not be retrieved.",

      detail:
        error.message

    });

  }

});


// ========================================
// FRONTEND FALLBACK
// ========================================
//
// Express 5 compatible.
// Do NOT use app.get("*") here.
//

app.get(/.*/, (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "index.html"
    )
  );

});


// ========================================
// START
// ========================================

app.listen(PORT, () => {

  console.log(
    `SIGNALWEAVE: http://localhost:${PORT}`
  );

});
