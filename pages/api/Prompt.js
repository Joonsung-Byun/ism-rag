import weaviate from "weaviate-client";
import { generativeParameters } from "weaviate-client";
import formidable from "formidable";
import fs from "fs";
import { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = formidable({ multiples: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log("폼 데이터 파싱 오류:", err);
      return res.status(500).json({ error: "파일 처리 오류" });
    }

    try {
      const photoFile = files.photo?.[0]; // files.photo?.[0]
      const buffer = fs.readFileSync(photoFile.filepath);
      const base64String = buffer.toString("base64");

      let response;
      const prompt = {
        prompt: `너는 안전관리전문가야, 내가 주는 정보를 토대로 안전관리측면에서 분석해줘
        내가 너에게 줄 수 있는 정보는 Base 64로 인코딩 된 현장 사진, 현장 위치, 날짜 온도, 바람과 필요시 입력하는 위험요소야.
        내가 원하는 형식은, 첫번째로 2~3문장의의 현장 분석 요약 글이 있고 그 아래에 각 위험요소마다 정리된 글이 필요해.
        각 위험요소는 다음과 같은 형식이야.
        위험요소 + 위험 수준이 처음 나올거야. 위험 수준은은 매우 위험, 위험, 유의로 구분해주고, 매우 위험일때는 ☠️, 위험일때는 🚨, 유의일때는 ⚠️이걸 넣어줘.  아이콘 설명은 따로 필요없어.
        그 다음으로는 대책방안이 나올거야. 대책방안은 위험요소를 줄이기 위한 구체적인 방법을 제시해줘.
        그 다음으로는 유사 사고 사례 및 참고사항이 나올거야. 이 부분은 내가 Weaviate에 벡터화한 데이터를 활용해서 제공해줘.

        예시를 주자면, 
        사진 내 분진과 가스 발생이 심각해 보이며, 설비의 파손 및 안전난간의 상태도 불안정해 보입니다. 작업장 내 정리정돈 상태도 개선이 필요합니다. 특히 분진 및 가스 노출은 즉각적인 대응이 필요합니다.
        1. 분질 및 가스 발생, 매우 위험 ☠️
        - 대책방안: 분진 및 가스 발생을 줄이기 위해, 환기 시스템을 강화하고, 작업 중 마스크 착용을 의무화합니다. 또한, 정기적인 청소 및 점검을 통해 분진 발생을 최소화합니다.
        - 유사 사고 사례 및 참고사항: 최근 유사한 작업장에서 분진으로 인한 호흡기 질환 사례가 발생했습니다. 이에 따라, 작업 환경 개선을 위한 추가 조치가 필요합니다.

        이런식으로 답을 제공해줘. 위험 요소를 줄때 ****로 강조해줘. 그리고 대책방안:, 유사 사고 사례 및 참고사항: 부분은 bold로 강조해줘.
        또한 위험요소와 위험수준를 ol태그를 사용하는 것 보다는 앞에 숫자를 넣어서 순서를 매겨줘.  
        숫자 리스트(1., 2. 등)가 깨지지 않도록 항목 제목은 **텍스트** 형식의 볼드만 사용하고 ****텍스트**** 같은 중첩 마크다운은 사용하지 마.
       
        현장 위치: ${files.location?.[0]}, 날짜: ${files.date?.[0]}, 온도: ${files.temperature?.[0]}도, 바람: ${files.wind?.[0]}m/s, 위험요소: ${files.hazard?.[0]? files.hazard?.[0]: "이미지 분석 후 위험 요소를 너가 직접 판단"}`,
        images: [base64String],
      };

      

      const client = await weaviate.connectToWeaviateCloud(
        process.env.WEAVIATE_URL, // Weaviate Cloud URL
        {
          authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY), // Weaviate API Key
          headers: {
            "X-OpenAI-Api-Key": process.env.OPENAI_API_KEY,
          },
        }
      );
      const myCollection = client.collections.use("Chunks");

      response = await myCollection.generate.nearText(
        "현장 안전 위험 요소 분석",
        {
          groupedTask: prompt,
          config: generativeParameters.openAI({
            model: "gpt-4.1-mini",
            maxTokens: 2000,
          }),
        }
      );

      console.log("Grouped task result:", response.generative?.text);
      return res.status(200).json(response.generative?.text);
    } catch (error) {
      console.error("파일 처리 중 오류:", error);
      return res.status(500).json({ error: "파일 처리 중 오류 발생" });
    }
  });
}
