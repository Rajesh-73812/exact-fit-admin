import uploadClient from "@/lib/uploadClient";
import { useState } from "react";

interface FileWithPreview {
  file: File;
  preview: string;
  uploadedUrl?: string;
  uploading?: boolean;
  error?: string;
  debug?: any;
}

export const usePresignedUpload = (folder: string = "uploads", multiple: boolean = false) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    // Clear old files if single mode
    if (!multiple) {
      setFiles((prev) => {
        prev.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
        return [];
      });
    }

    setUploading(true);
    console.log("UPLOAD STARTED - Files:", newFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));

    const fileEntries: FileWithPreview[] = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      debug: { step: "queued" },
    }));

    setFiles((prev) => (multiple ? [...prev, ...fileEntries] : fileEntries));

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const indexInState = files.length + i;

        console.log(`\nUPLOADING FILE ${i + 1}/${newFiles.length}:`, file.name);
        console.log("→ Size:", (file.size / 1024 / 1024).toFixed(2) + " MB");
        console.log("→ Type:", file.type || "unknown");

        // STEP 1: Get presigned URL
        console.log("Requesting presigned URL from backend...");
        const res = await uploadClient.post("/upload-image", {
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          folder,
        });

        const { uploadUrl, filePath, publicUrl } = res.data;

        console.log("Presigned URL received!");
        console.log("→ Key:", filePath);
        console.log("→ Public URL:", publicUrl);
        console.log("→ PUT URL (first 150 chars):", uploadUrl.substring(0, 150) + "...");

        // Check if Content-Type is in the URL (MUST BE!)
        const hasContentType = uploadUrl.includes("Content-Type") || uploadUrl.includes("content-type");
        console.log("Content-Type in URL?", hasContentType ? "YES" : "NO ← THIS IS THE PROBLEM!");

        // STEP 2: Upload to S3
        console.log("Starting PUT to S3...");
        const putResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          // DO NOT set headers — let browser use the one from presigned URL
        });

        console.log("PUT Response Status:", putResponse.status, putResponse.statusText);

        if (!putResponse.ok) {
          const errorText = await putResponse.text();
          console.error("S3 UPLOAD FAILED!");
          console.error("Status:", putResponse.status);
          console.error("Response:", errorText);
          throw new Error(`S3 Upload failed: ${putResponse.status} ${errorText}`);
        }

        console.log("UPLOAD SUCCESSFUL!");
        uploadedUrls.push(publicUrl);

        // Update state
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === indexInState
              ? { ...f, uploadedUrl: publicUrl, uploading: false, debug: { step: "done" } }
              : f
          )
        );
      }

      console.log("ALL FILES UPLOADED:", uploadedUrls);
      return multiple ? uploadedUrls : uploadedUrls[0];

    } catch (err: any) {
      console.error("UPLOAD FAILED:", err);
      setFiles((prev) =>
        prev.map((f) =>
          fileEntries.some((fe) => fe.file === f.file)
            ? { ...f, uploading: false, error: err.message || "Upload failed" }
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
      console.log("Removed file:", removed?.file?.name);
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
