import { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "sonner";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  min?: number;
}

export function ImageUploader({ value, onChange, max = 10, min = 3 }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (value.length + files.length > max) {
      toast.error(`Maximum ${max} images allowed`);
      return;
    }
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadToCloudinary));
      onChange([...value, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {value.map((url, i) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
            <img src={url} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((u) => u !== url))}
              className="absolute top-1 right-1 p-1 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition"
              aria-label="Remove"
            >
              <X className="w-4 h-4" />
            </button>
            {i === 0 && (
              <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gold text-gold-foreground">
                Featured
              </div>
            )}
          </div>
        ))}
        {value.length < max && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-gold cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-gold transition">
            {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
            <span className="text-xs">Add image</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {value.length}/{max} images · minimum {min} required
      </p>
    </div>
  );
}
