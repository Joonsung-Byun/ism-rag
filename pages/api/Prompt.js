import weaviate from "weaviate-client";
import { generativeParameters } from "weaviate-client";

export default async function handler(req, res) {
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

  const { photo, location, date, temperature, wind, hazard } = req.body;

  console.log("hazard", hazard ? hazard : "이미지 분석 후 위험 요소를 너가 직접 판단");

  if (!photo || !location || !date || !temperature || !wind) {
    return res.status(400).json({ error: "모든 필드를 입력해주세요." });
  }

  const cleanedPhoto = photo.replace(/^data:image\/[a-z]+;base64,/, "");

  try {
    let response;
    const prompt = {
      prompt: `나는 너에게 현장 안전 위험 요소 분석을 요청할거야. 내가 너에게 줄 수 있는 정보는 Base 64로 인코딩 된 현장 사진, 현장 위치, 날짜 온도, 바람과 필요시 입력하는 위험요소야. 
      위험 요소는 선택사항이기 때문에 없으면 "없음"으로 너에게 전달할게.
        이 정보를 바탕으로 현장 안전 위험 요소를 분석해줘.
        {
            현장 위치: ${location}
            날짜: ${date}
            온도: 섭씨 ${temperature} 
            바람: ${wind} m/s
            위험 요소: ${hazard ? hazard : "이미지 분석 후 위험 요소를 너가 직접 판단"}        
        }

        현장 사진은 아래에 첨부할게.
        한국말로 대답을 해주고, 위 정보와 이미지 분석을 바탕으로 아래 항목을 한국어로 분석해줘줘:
        1. 예상되는 위험 요소
        2. 위험 수위 (낮음/중간/높음으로 등급화)
        3. 권장 대책 방안
        4. 유사 사고 사례 (Weaviate에서 vector 검색된 결과를 기반으로)

        유사 사고 사례를 줄때 pdf 파일의 메타데이터를 포함해서 어떤 사례가 있었는지 자세히 알려줘. 만약 pdf 파일에 유사사례가 있으면 언제, 어디서, 어떤 사고가 있었는지 알려줘.
        만약 이미지 분석에 실패했다면, 다른 답변을 주지 말고 왜 이미지 분석에 실패했는지 이유를 알려줘.
        `,
      images: [cleanedPhoto],
    };

    response = await myCollection.generate.nearText( "현장 안전 위험 요소 분석", {
        groupedTask: prompt,
        config: generativeParameters.openAI({
          model: "gpt-4.1-mini",  
          maxTokens: 2000,
        }),
      }
    )

    console.log("Grouped task result:", response.generative?.text);
    return res.status(200).json(response.generative?.text);
  } catch (error) {
    console.error("Error calling GPT-4o API:", error);
    return res.status(500).json({ error: "GPT-4o API 호출 실패" });
  }
}
