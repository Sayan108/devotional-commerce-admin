import React, { useState } from "react";
import { uploadMedia } from "./api";
import { ErrorMessage } from "./ui";

export function MediaUpload({ onUploaded }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  async function upload(event) {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError(new Error("Choose a JPEG, PNG, or WebP image smaller than 5 MB.")); return;
    }
    setBusy(true); setError(null);
    try { onUploaded(await uploadMedia(file)); }
    catch (error) { setError(error); }
    finally { setBusy(false); }
  }
  return <div><label>Upload image to Cloudinary<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={upload}/></label>
    {busy && <p role="status">Uploading image…</p>}<ErrorMessage error={error}/>
  </div>;
}
