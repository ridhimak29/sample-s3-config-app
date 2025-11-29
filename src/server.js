import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Holds config data loaded from S3 during startup.
let cachedConfig = [];

async function loadConfigFromS3() {
  const bucket = process.env.S3_BUCKET;
  const key = process.env.S3_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!bucket || !key) {
    console.warn('S3_BUCKET and S3_KEY must be set. Returning empty config.');
    return [];
  }

  const client = new S3Client({ region });
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const response = await client.send(command);

  const body = await response.Body.transformToString();

  try {
    const data = JSON.parse(body);
    if (Array.isArray(data)) {
      return data;
    }
    return [data];
  } catch (error) {
    console.error('Failed to parse S3 config JSON:', error);
    return [];
  }
}

app.get('/api/config', (_req, res) => {
  res.json({ data: cachedConfig });
});

app.use(express.static(path.join(__dirname, 'public')));

async function startServer() {
  try {
    cachedConfig = await loadConfigFromS3();
    console.log(`Loaded ${cachedConfig.length} config entries from S3`);
  } catch (error) {
    console.error('Error loading config from S3:', error);
  }

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

startServer();
