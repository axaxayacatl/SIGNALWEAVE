# SIGNALWEAVE

**SIGNALWEAVE** is a public-source discovery system that turns a single subject, phrase, object, or idea into a field of related cultural references.

Enter one signal. The system retrieves adjacent traces from public indexes and presents them together without rankings, scores, or a declared "best" result.

## Features

* Minimal dark interface
* Single-signal discovery
* Public-source retrieval
* Wikipedia integration
* iTunes Search integration
* Backend API proxy
* No user API-key configuration
* Responsive layout
* Non-ranked results
* Direct source links
* Lightweight Node.js architecture

## How it works

```text
SIGNAL
   ↓
SIGNALWEAVE
   ↓
PUBLIC INDEXES
   ↓
RELATED TRACES
   ↓
REFERENCE FIELD
```

A query is sent to the SIGNALWEAVE backend. The backend requests publicly available results from supported sources, normalizes them into a common structure, and returns them to the interface.

Each result contains a source, title, description, optional image, and link to the original source.

## Stack

* HTML
* CSS
* JavaScript
* Node.js
* Express
* Wikipedia API
* iTunes Search API

## Run locally

### Requirements

Node.js 18 or newer.

### Install

```bash
npm install
```

### Start

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

No API key is required for the included public-source integrations.

## Project structure

```text
SIGNALWEAVE/
├── public/
│   └── index.html
├── server.js
├── package.json
├── README.md
└── .gitignore
```

## API

SIGNALWEAVE exposes a simple backend endpoint:

```text
GET /api/weave?q=QUERY
```

Example:

```text
/api/weave?q=architecture
```

The endpoint returns normalized discovery data:

```json
{
  "query": "architecture",
  "count": 12,
  "signals": [
    {
      "type": "REFERENCE",
      "title": "Example",
      "text": "Description...",
      "url": "https://...",
      "image": null,
      "source": "WIKIPEDIA"
    }
  ]
}
```

## Design principle

SIGNALWEAVE is designed as a **discovery field rather than a ranking engine**.

Results are presented as adjacent references. The system does not assign quality scores, popularity scores, tiers, winners, or recommended choices.

The purpose is to expose relationships between signals and let the user decide what to follow.

## Data sources

SIGNALWEAVE currently uses public search interfaces provided by:

* Wikipedia
* Apple iTunes Search

Results remain attributable to their originating sources and link back to the original resource.

## Development

Start the local server:

```bash
npm start
```

Modify:

```text
public/index.html
```

for interface changes and:

```text
server.js
```

for backend and API behavior.

## License

This repository does not currently specify a license. All rights to third-party data, images, trademarks, and linked resources remain with their respective owners.

---

**SIGNALWEAVE / 001**

`ONE SIGNAL → MANY TRACES`

