import weaviate from 'weaviate-client';

const weaviateUrl = process.env.WEAVIATE_URL;
const weaviateApiKey = process.env.WEAVIATE_API_KEY;

const client = await weaviate.connectToWeaviateCloud(
  weaviateUrl, // Replace with your Weaviate Cloud URL
  {
    authCredentials: new weaviate.ApiKey(weaviateApiKey),
  }
);

var clientReadiness = await client.isReady();

export { clientReadiness };