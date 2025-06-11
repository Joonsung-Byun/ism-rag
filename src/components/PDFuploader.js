"use client";
import React, { useState } from 'react';
import axios from 'axios';
const PDFUploader = () => {
    // State to store the selected PDF file and its information
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError('PDF 파일만 업로드 가능합니다.');
        }
    };

    // Handle file upload
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('파일을 선택해주세요.');
            return;
        }

        setIsUploading(true);
        try {
            
            const formData = new FormData();
            formData.append('file', file);
            const response = await axios.post('/api/Vectorizing', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                console.log('Upload successful:', response.data);
                setFile(null); // Reset file after successful upload
                setError(null); // Clear any previous errors
                setIsUploading(false); // Reset uploading state
                alert('파일 업로드가 완료되었습니다.');
            }

        } catch (err) {
            console.error('Upload failed:', err);
            setError('업로드에 실패했습니다. 다시 시도해주세요.');
            setIsUploading(false);
        }
    };

    return (
        <div className="pdf-uploader">
            <h2>PDF 파일 업로더</h2>
            
            <form onSubmit={handleUpload}>
                <div className="file-input-wrapper">
                    <input
                        type="file"
                        id="pdf-file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="file-input"
                    />
                    <label htmlFor="pdf-file" className="file-label">
                        PDF 파일 선택하기
                    </label>
                </div>

                {file && (
                    <div className="file-info">
                        <p><strong>파일명:</strong> {file.name}</p>
                        <p><strong>크기:</strong> {(file.size / 1024).toFixed(2)} KB</p>
                        <p><strong>타입:</strong> {file.type}</p>
                    </div>
                )}

                {error && <p className="error-message">{error}</p>}

                <button 
                    type="submit" 
                    disabled={!file || isUploading} 
                    className="upload-button"
                >
                    {isUploading ? '업로드 중...' : '업로드'}
                </button>
            </form>

            <style jsx>{`
                .pdf-uploader {
                    max-width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                }
                .file-input {
                    display: none;
                }
                .file-label {
                    display: inline-block;
                    padding: 10px 15px;
                    background: #4285f4;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .file-info {
                    margin-top: 15px;
                    padding: 10px;
                    background: #f5f5f5;
                    border-radius: 4px;
                }
                .error-message {
                    color: #d32f2f;
                }
                .upload-button {
                    margin-top: 15px;
                    padding: 10px 20px;
                    background: #0f9d58;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .upload-button:disabled {
                    background: #cccccc;
                }
            `}</style>
        </div>
    );
};

export default PDFUploader;