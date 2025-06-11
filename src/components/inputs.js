"use client";
import React, { useState, useEffect } from "react";
import MarkdownViewer from "@/components/MarkdownViewer";
import axios from "axios";
export default function Inputs() {
  const [photoPreview, setPhotoPreview] = useState(null); // 썸네일
  const [photoBase64, setPhotoBase64] = useState(""); // GPT-4o 전송용

  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [wind, setWind] = useState("");
  const [hazard, setHazard] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [answer, setAnswer] = useState(null);


  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 썸네일 미리보기
    const previewURL = URL.createObjectURL(file);
    setPhotoPreview(previewURL);

    // base64 변환
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPhotoBase64(base64); // GPT-4o에 쓸 data:image/jpeg;base64,... 형식 포함됨
    };
    reader.readAsDataURL(file);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    const response = await axios.post("/api/Prompt", {
      photo: photoBase64,
      location: location,
      date: date,
      temperature: temperature,
      wind: wind,
      hazard: hazard,
    }).then((res) => {
      console.log("Response from GPT-4o:", res.data);
      // 여기에 응답 처리 로직 추가
      setAnswer(res.data); // 응답에서 answer 필드 추출
    }).catch((error) => {
      console.error("Error calling GPT-4o API:", error);
    })

    // 여기에 GPT-4o API 호출 로직 추가
    // 예시: await callGPT4oAPI(photoBase64, location, date, temperature, wind, hazard);

    // 완료 후 상태 초기화
    setPhotoPreview(null);
    setPhotoBase64("");
    setLocation("");
    setDate("");
    setTemperature("");
    setWind("");
    setHazard("");
    setIsLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        안전 위험요소 분석
      </h2>

      <form className="space-y-4 max-w-md mx-auto">
        {/* 사진 업로드 */}
        <div>
          <label className="block mb-1 font-semibold text-gray-800">
            현장 사진
          </label>
          <input
            accept="image/*"
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={handleImageChange}
            required
          />
          {photoPreview && (
            <div className="mt-4">
              <img
                src={photoPreview}
                alt="업로드된 사진 미리보기"
                className="w-full h-auto rounded shadow max-w-[300px] mx-auto"
              />
            </div>
          )}
        </div>
        {/* 현장 위치, 날짜 */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 font-semibold text-gray-800">
              현장 위치
            </label>
            <input
              type="text"
              placeholder="현장 위치"
              required
              className="input input-bordered w-full"
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-semibold text-gray-800">
              날짜
            </label>
            <input
              type="date"
              required
              className="input input-bordered w-full"
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* 날씨 정보 */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 font-semibold text-gray-800">
              온도
            </label>
            <div className="flex input input-bordered w-full">
            <input
              type="text"
              placeholder="온도 °C"
              onChange={(e) => setTemperature(e.target.value)}
              required
            />  
              <span>°C</span>
            </div>
            
          </div>


          <div className="flex-1">
            <label className="block mb-1 font-semibold text-gray-800">
              바람
            </label>
            <div className="flex input input-bordered w-full">
              <input
                type="numrber"
                placeholder="바람 초속(m/s)"
                className=""
                required
                onChange={(e) => setWind(e.target.value)}
              />
              <span>m/s</span>
            </div>
          </div>
        </div>

        {/* 위험요소 입력 */}
        <div>
          <label className="block mb-1 font-semibold text-warning">
            ⚠ 위험요소 입력 (필요시)
          </label>
          <textarea
            placeholder=""
            maxLength={256}
            className="textarea textarea-bordered w-full h-24"
            onChange={(e) => setHazard(e.target.value)}
          ></textarea>
          <div className="text-right text-sm text-gray-500">0 / 256</div>
        </div>

        {/* 분석 요청 버튼 */}
        <div className="text-center">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isLoading}>
            🔍 분석 요청
          </button>
        </div>
      </form>

      <div id="result" className="mt-8 p-4 bg-gray-200 rounded-lg shadow">
        
          {
            isLoading ? (
              <span className="loading loading-bars loading-xl"></span>
            ) : (
              <div className="text-center mt-6 text-gray-600">
                {
                  answer ? (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">분석 결과</h3>
                       <MarkdownViewer content={answer} />
                    </div>
                  ) : (
                    <span>분석 결과가 여기에 표시됩니다.</span>
                  )
                }
              </div>
            )
          }
      </div>


    </div>
  );
}
