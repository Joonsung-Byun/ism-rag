"use client";
import React, { useState, useEffect, useRef } from "react";
import MarkdownViewer from "@/components/MarkdownViewer";
import axios from "axios";
export default function Inputs() {

  const resultRef = useRef(null);


  const [photo, setPhoto] = useState(null); // 업로드된 사진
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
    setPhoto(file); // 업로드된 사진 상태 업데이트
    if (!file) return;
    console.log(file);
    // 썸네일 미리보기
    const previewURL = URL.createObjectURL(file);
    setPhotoPreview(previewURL);

    // base64 변환
    // const reader = new FileReader();
    // reader.onloadend = () => {
    //   const base64 = reader.result;

    //   setPhotoBase64(base64); // GPT-4o에 쓸 data:image/jpeg;base64,... 형식 포함됨
    // };
    // reader.readAsDataURL(file);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    resultRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsLoading(true);

    // const formData = new FormData();
    // formData.append("photo", photo); // File 객체
    // formData.append("location", location);
    // formData.append("date", date);
    // formData.append("temperature", temperature);
    // formData.append("wind", wind);
    // if (hazard) {
    //   formData.append("hazard", hazard);
    // }

    // try {
    //   const res = await axios.post("/api/Prompt", formData, {
    //     headers: { "Content-Type": "multipart/form-data" },
    //   });
    //   if (res.status === 200) {
    //     console.log("Response from GPT-4o:", res.data);
    //     setAnswer(res.data);
    //   }
    // } catch (error) {
    //   console.error("Error calling GPT-4o API:", error);
    // } finally {
    //   setPhotoPreview(null);
    //   setPhotoBase64("");
    //   setLocation("");
    //   setDate("");
    //   setTemperature("");
    //   setWind("");
    //   setHazard("");
    //   setIsLoading(false);
    // }
  }

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-md rounded-lg min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-6 pt-4 text-gray-800">
        AI 현장 위험성 분석
      </h2>
      
      <div className="md:flex md:gap-4 p-4 relative">
        <section className="md:w-1/2 md:pr-6">
          <form className="space-y-4 max-w-md mx-auto md:mx-0">
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
                    className="w-full h-auto rounded shadow max-w-[300px] mx-auto md:mx-0"
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
                  value={location}
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
                  value={date}
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
                    value={temperature}
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
                    type="number"
                    value={wind}
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
                value={hazard}
              ></textarea>
              <div className="text-right text-sm text-gray-500">0 / 256</div>
            </div>

            {/* 분석 요청 버튼 */}
            <div className="text-center md:text-left">
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                🔍 분석 요청
              </button>
            </div>
          </form>
        </section>
        
        {/* Vertical divider for medium screens and above */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 transform -translate-x-1/2"></div>
        
        <div id="result" ref={resultRef} className="md:w-1/2 mt-8 md:mt-0 bg-gray-50 rounded-lg shadow min-h-[600px] md:min-h-[700px] flex justify-center items-center p-4">
          {isLoading ? (
            <span className="loading loading-spinner text-primary mx-auto block" id="target"></span>
          ) : (
            <div className="w-full text-gray-600">
              {answer ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center md:text-left">
                    분석 결과
                  </h3>
                  <MarkdownViewer content={answer} />
                </div>
              ) : (
                <span className="block text-center">분석 결과가 여기에 표시됩니다.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
