// Cloudinary unsigned uploads for Elimi Trust Ltd
const CLOUD_NAME = "dcncethrs";
const UPLOAD_PRESET = "elimitrusteltd";

export async function uploadToCloudinary(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Upload failed: ${txt}`);
  }
  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}
