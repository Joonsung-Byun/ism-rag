import weaviate from 'weaviate-client';
import { vectorizer, dataType  } from 'weaviate-client';

console.log("Connecting to Weaviate Cloud...");

const client = await weaviate.connectToWeaviateCloud(
  process.env.WEAVIATE_URL, // Replace with your Weaviate Cloud URL
  {
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY), // Replace with your Weaviate Cloud API key
    headers: {
      'X-OpenAI-Api-Key':process.env.OPENAI_API_KEY,
    },
  }
);

const embeddedFileSchema = {
  name: "Chunks",
  description: "Relevant chunks of text from selected PDF files",
  properties: [
    {
      name: "chunk_text",
      dataType: dataType.TEXT
    },
    {
      name: "file_name",
      dataType: dataType.TEXT,
    },
    {
      name: "metadata",
      dataType: dataType.OBJECT,
      nestedProperties: [
        {
          name: "totalPages",
          dataType: dataType.INT
        },
        {
          name: "pageNumberLocation",
          dataType: dataType.INT
        },
        {
          name: "chunkIndex",
          dataType: dataType.INT
        },
      ],
    },
  ],

  vectorizers: vectorizer.text2VecOpenAI({
    model: 'text-embedding-3-large',
  }),

  generative: weaviate.configure.generative.openAI({
    model: "gpt-4o",
  }),
  

};

export async function addCollection() {
    console.log("시작! Adding the Chunks collection...");
  try {
    await client.collections.create(embeddedFileSchema);
    console.log("Added the Chunks collection");
  } catch (err) {
    console.log(err)
    console.error("Failed to add the Chunks collection");
  }
}

export async function deleteCollection() {
  try {
    await client.collections.delete("Chunks");
    console.log("Deleted the Chunks collection");
  } catch (err) {
    console.error("Failed to delete the Chunks collection:", err);
  }
}

addCollection()


