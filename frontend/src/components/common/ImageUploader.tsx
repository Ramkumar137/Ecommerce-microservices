import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { uploadImage } from "@/api/upload";
import { toast } from "sonner";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUploader({
  value,
  onChange,
}: Props) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];

    if (!file) return;

    try {
      setUploading(true);

      const imageUrl = await uploadImage(file);

      onChange(imageUrl);

      toast.success("Image uploaded successfully.");
    } catch (err) {
      console.error(err);

      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    multiple: false,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
    onDrop,
  });

  return (
    <div className="space-y-3">

      <div
        {...getRootProps()}
        className={`
          border-2
          border-dashed
          rounded-xl
          p-8
          text-center
          cursor-pointer
          transition

          ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30"
          }
        `}
      >

        <input {...getInputProps()} />

        {uploading ? (
          <>

            <Loader2 className="mx-auto mb-3 size-8 animate-spin" />

            <p>Uploading...</p>

          </>
        ) : (
          <>

            <Upload className="mx-auto mb-3 size-8" />

            <p className="font-medium">
              Drag & Drop Image
            </p>

            <p className="text-sm text-muted-foreground">
              or click to browse
            </p>

          </>
        )}

      </div>

      {value && (

        <div className="overflow-hidden rounded-lg border">

          <img
            src={value}
            alt="Preview"
            className="h-48 w-full object-cover"
          />

        </div>

      )}

      {!value && !uploading && (

        <div className="flex items-center justify-center rounded-lg border p-10">

          <ImageIcon className="size-10 text-muted-foreground" />

        </div>

      )}

    </div>
  );
}