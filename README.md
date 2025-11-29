# Sample S3 Config App

This sample Node.js + Express application downloads configuration data from Amazon S3 when the server boots and exposes it on a simple HTML table.

## Prerequisites

- Node.js 18+
- AWS credentials with read access to the S3 object that stores your configuration JSON.

## Configuration

Set the following environment variables before starting the server:

- `AWS_REGION` – AWS region where your bucket resides (defaults to `us-east-1`).
- `S3_BUCKET` – Name of the S3 bucket containing the config file.
- `S3_KEY` – Key/path to the config file (e.g. `configs/app-config.json`).
- `PORT` – Optional port for the HTTP server (defaults to `3000`).

The config file in S3 should be JSON—either an array of objects or a single object. Single objects will be wrapped in an array automatically for display purposes.

## Install & Run

```bash
npm install
npm start
```

Then open `http://localhost:3000` to see the configuration rendered as a table.

If the configuration has no rows or cannot be parsed, the UI shows a helpful status message. Check the server logs for additional details when debugging connectivity or parsing issues.
