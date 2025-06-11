import formidable from 'formidable';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import fs from 'fs';
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import weaviate from 'weaviate-client';

export const config = {
  api: {
    bodyParser: false, // 기본 bodyParser 비활성화
  },
};

let client;
const OPTIMAL_CHUNK_SIZE = 200  // tokens
const CHUNK_OVERLAP = 40
const CHARS_PER_TOKEN = 4 // Average for Llama-friendly models (emprically determined)

export default async function handler(req, res) {
  const form = formidable({
    maxFileSize: 20 * 1024 * 1024, // 20MB 제한
    filter: ({ mimetype }) => mimetype && mimetype === 'application/pdf', // PDF만 허용
  });

  try {
    const [fields, files] = await form.parse(req);
    const uploadedFile = files.file?.[0];

    if (!uploadedFile) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'PDF 파일이 필요합니다.' });
    }

    // uploads 디렉토리 확인 및 생성
    const uploadPath = path.join(process.cwd(), 'Uploads');
    try {
      await fsPromises.mkdir(uploadPath, { recursive: true });
    } catch (err) {
      console.error('Error creating uploads directory:', err);
    }

    // 기존 파일 삭제
    try {
      const existingFiles = await fsPromises.readdir(uploadPath);
      for (const file of existingFiles) {
        await fsPromises.unlink(path.join(uploadPath, file));
      }
    } catch (err) {
      console.error('Error deleting existing files:', err);
    }

    // 파일 저장
    const uploadedFilePath = path.join(uploadPath, uploadedFile.originalFilename);
    const readableStream = new Readable();
    readableStream.push(await fsPromises.readFile(uploadedFile.filepath));
    readableStream.push(null);
    console.log('checkpoint 1');

    await pipeline(readableStream, fs.createWriteStream(uploadedFilePath));

    console.log('File uploaded:', uploadedFilePath);

    const addedFileData = await createFileDataObject(uploadedFilePath, uploadPath);

    console.log('File data processed and added to Weaviate:', addedFileData);

    return res.status(200).json({
      success: 'File uploaded and processed successfully.',
      data: addedFileData,
    });
  } catch (err) {
    console.error('Error processing request:', err);
    if (err.httpCode === 413) {
      return res.status(413).json({ error: '파일 크기가 10MB를 초과했습니다.' });
    }
    return res.status(500).json({ error: '파일 업로드 실패' });
  }
}

async function createFileDataObject(uploadedFilePath, uploadPath) {
    const fileData = await fsPromises.readFile(uploadedFilePath)
    const fileBlob = new Blob([fileData])

    const loader = new WebPDFLoader(fileBlob, {
        splitPages: true,
    })

    const docs = await loader.load()
    const chunks = []

    for (const doc of docs) {
        const pageContent = doc.pageContent

        // Calculate chunks with overlapping content
        let startPos = 0
        while (startPos < pageContent.length) {
            const chunk = pageContent.slice(startPos, startPos + (OPTIMAL_CHUNK_SIZE * CHARS_PER_TOKEN))

            chunks.push({
                chunk_text: chunk,
                file_name: path.basename(uploadedFilePath),
                metadata: {
                    totalPages: docs.length,
                    pageNumberLocation: doc.metadata?.loc?.pageNumber,
                    chunkIndex: chunks.length,
                }
            })

            startPos += ((OPTIMAL_CHUNK_SIZE - CHUNK_OVERLAP) * CHARS_PER_TOKEN)
        }
    }

    console.log('Total chunks created:', chunks.length)

    await importFileChunks(chunks, uploadPath)

    return {
      message: 'File data processed successfully',
    }
}

async function importFileChunks(chunks, uploadPath) {
   client = await weaviate.connectToWeaviateCloud(
  process.env.WEAVIATE_URL, // Replace with your Weaviate Cloud URL
  {
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY), // Replace with your Weaviate Cloud API key
    headers: {
      'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY,
    },
  }
);
    const fileChunkCollection = client.collections.get('Chunks')

    // Create a log file with timestamp
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
	const logPath = path.join(uploadPath, `chunks-log-${timestamp}.json`)

	// Write initial chunks data
	await fsPromises.writeFile(
		logPath,
		JSON.stringify(
			{
				totalChunks: chunks.length,
				timestamp: new Date().toISOString(),
				chunks: chunks.map((chunk) => ({
					text: chunk.chunk_text,
					fileName: chunk.file_name,
					metadata: chunk.metadata
				}))
			},
			null,
			2
		)
	)

	console.log(`Chunk log written to: ${logPath}`)
    const BATCH_SIZE = 100
    const batches= []

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        batches.push(chunks.slice(i, i + BATCH_SIZE))
    }

    console.log(`Inserting ${batches.length} batches of ${BATCH_SIZE} chunks each`)

    let totalInserted = 0
    for (const [index, batch] of batches.entries()) {
        try {
            await fileChunkCollection.data.insertMany(batch)
            totalInserted += batch.length
            console.log(
                `Progress: ${totalInserted} / ${chunks.length} chunks inserted (${Math.round(
                    (totalInserted / chunks.length) * 100)}%)`
            )

        } catch (e) {
            console.error(`Failed at chunk ${totalInserted + 1}: `, e)
            throw e
        }
    }

}

