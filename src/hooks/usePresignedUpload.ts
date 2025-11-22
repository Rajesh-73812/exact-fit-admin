// hooks/usePresignedUpload.ts  ← FINAL & PERFECT VERSION

import uploadClient from "@/lib/uploadClient";
import { useState } from "react";

interface FileWithPreview {
  file: File;
  preview: string;
  uploadedUrl?: string;
  uploading?: boolean;
  error?: string;
}

export const usePresignedUpload = (
  folder: string = "uploads",
  multiple: boolean = false
) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    if (!multiple) {
      setFiles((prev) => {
        prev.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
        return [];
      });
    }

    setUploading(true);

    const fileEntries: FileWithPreview[] = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    setFiles((prev) => (multiple ? [...prev, ...fileEntries] : fileEntries));

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];

        // 1. Get presigned URL
        const res = await uploadClient.post("/upload-image", {
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          folder,
        });

        const { uploadUrl, filePath } = res.data;

        // 2. Upload to S3 (NO Content-Type header!)
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            // Force no content-type in request
            "Content-Type": "",
          },
        });

        // 3. Build public URL
        const bucket = process.env.NEXT_PUBLIC_S3_BUCKET;
        const region = process.env.NEXT_PUBLIC_S3_REGION || "ap-south-1";
        const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${filePath}`;

        uploadedUrls.push(publicUrl);
      }

      // 4. Update state with real uploaded URLs
      setFiles((prev) =>
        prev.map((f, idx) => {
          const matchIdx = fileEntries.findIndex((fe) => fe.file === f.file);
          if (matchIdx > -1) {
            return {
              ...f,
              uploadedUrl: uploadedUrls[matchIdx],
              uploading: false,
            };
          }
          return f;
        })
      );

      return multiple ? uploadedUrls : uploadedUrls[0];
    } catch (err: any) {
      console.error("Upload failed:", err);
      setFiles((prev) =>
        prev.map((f) =>
          fileEntries.some((fe) => fe.file === f.file)
            ? { ...f, uploading: false, error: "Upload failed" }
            : f
        )
      );
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const removed = prev[index];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const getUploadedUrls = () =>
    files.filter((f) => f.uploadedUrl).map((f) => f.uploadedUrl!);

  return {
    files,
    uploading,
    uploadFiles,
    removeFile,
    getUploadedUrls,
  };
};
