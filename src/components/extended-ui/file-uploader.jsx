import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import apiService from "@/services/apiService";
import { set } from "lodash";

// uploadstatus = idle, uploading, success, error
const FileUploader = ({ onChange, documentType }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };
  const handleFileUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    try {
      const response = await apiService.post("/file-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
            : 0;
          setUploadProgress(progress);
        },
      });
      if (response) {
        const fileName = response.data?.file?.filename;
        const filePath = `http://localhost:8080/uploads/documents/${fileName}`;
        onChange(filePath);
      }
      setStatus("success");
      setUploadProgress(100);
    } catch (error) {
      setStatus("error");
      setUploadProgress(0);
      console.log(error);
    }
  };

  return (
    <div className="space-y-2">
      <Input type="file" onChange={handleFileChange} />
      {file && (
        <div className="mb-4 text-sm">
          <p>File Name: {file?.name}</p>
          {/* <p>File Type: {file?.type}</p> */}
          <p>File Size: {(file?.size / 1024).toFixed(2)} KB</p>
        </div>
      )}
      {status === "uploading" && (
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <p>{uploadProgress}% uploaded</p>
          </div>
        </div>
      )}
      {file && status !== "uploading" && (
        <Button onClick={handleFileUpload}>Upload</Button>
      )}

      {status === "success" && <p>File uploaded successfully</p>}
      {status === "error" && <p>File upload failed</p>}
    </div>
  );
};

export default FileUploader;
