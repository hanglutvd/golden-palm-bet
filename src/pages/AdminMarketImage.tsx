import { useState, useRef } from 'react';
import { Upload, ImageIcon, Trash2, Save, Loader2 } from 'lucide-react';
import { trpc } from '@/providers/trpc';

export function AdminMarketImage() {
  const utils = trpc.useUtils();
  const { data: images, isLoading: isQueryLoading } = trpc.config.getMarketImages.useQuery();
  const saveMutation = trpc.config.setMarketImages.useMutation({
    onSuccess: () => {
      utils.config.getMarketImages.invalidate();
      setFiles([null, null, null]);
      setPreviews([null, null, null]);
      setUploading(false);
      alert('行情图片已保存');
    },
    onError: (err) => {
      setUploading(false);
      alert(err.message || '保存失败');
    },
  });

  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [previews, setPreviews] = useState<(string | null)[]>([null, null, null]);
  const [uploading, setUploading] = useState(false);
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const labels = [
    'Screen Daily 场刊评分表',
    '华语媒体场刊评分表',
    '陀螺电影场刊评分表',
  ];

  const handleFileChange = (index: number, file: File | null) => {
    if (!file) return;
    const nextFiles = [...files];
    nextFiles[index] = file;
    setFiles(nextFiles);

    const reader = new FileReader();
    reader.onload = (e) => {
      const nextPreviews = [...previews];
      nextPreviews[index] = e.target?.result as string;
      setPreviews(nextPreviews);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (index: number) => {
    const nextFiles = [...files];
    nextFiles[index] = null;
    setFiles(nextFiles);

    const nextPreviews = [...previews];
    nextPreviews[index] = null;
    setPreviews(nextPreviews);
  };

  const handleSave = async () => {
    setUploading(true);
    try {
      const uploadedUrls: (string | undefined)[] = [];

      for (let i = 0; i < 3; i++) {
        if (files[i]) {
          const formData = new FormData();
          formData.append('file', files[i]);

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || `图片 ${i + 1} 上传失败`);
          }

          const { url } = await res.json();
          uploadedUrls[i] = url;
        } else if (images?.[i]) {
          uploadedUrls[i] = images[i];
        }
      }

      const finalUrls = uploadedUrls.filter((u): u is string => !!u);
      console.log('[AdminMarketImage] Saving images:', finalUrls);

      saveMutation.mutate({ images: finalUrls });
    } catch (err: any) {
      alert(err.message || '保存失败');
      setUploading(false);
    }
  };

  const hasChanges = files.some(Boolean);
  const hasImages = images && images.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">行情图片管理</h1>

      <div className="rounded-lg bg-app-card border border-app-border p-4 space-y-5">
        <p className="text-sm text-muted-foreground">
          直接上传场刊评分表图片（JPG/PNG/WEBP，单张不超过 5MB）。
          首页「口碑中心」将显示这些图片。
          {hasImages && <span className="text-app-gold ml-1">当前已保存 {images?.length || 0} 张图片</span>}
        </p>

        {labels.map((label, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-app-gold" />
              <span className="text-sm font-medium text-foreground">{label}</span>
              {images?.[i] && !previews[i] && !files[i] && (
                <span className="text-xs text-green-500 ml-auto">已有图片</span>
              )}
            </div>

            {/* Preview area */}
            <div className="relative rounded-md border border-app-border bg-app-bg overflow-hidden">
              {previews[i] ? (
                <div className="relative">
                  <img src={previews[i]!} alt={label} className="w-full h-48 object-contain" />
                  <button
                    onClick={() => handleRemove(i)}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : images?.[i] ? (
                <div className="relative">
                  <img src={images[i]} alt={label} className="w-full h-48 object-contain" />
                  <button
                    onClick={() => handleRemove(i)}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 text-xs text-white bg-black/60 px-2 py-0.5 rounded">
                    当前图片
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => inputRefs[i].current?.click()}
                  className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-app-hover transition-colors"
                >
                  <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <span className="text-xs text-muted-foreground">点击上传图片</span>
                </div>
              )}
            </div>

            <input
              ref={inputRefs[i]}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(i, e.target.files?.[0] || null)}
              className="hidden"
            />

            {previews[i] && (
              <button
                onClick={() => inputRefs[i].current?.click()}
                className="text-xs text-app-gold hover:text-app-gold/80 transition-colors"
              >
                重新选择
              </button>
            )}
          </div>
        ))}

        {/* Save button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={uploading || (!hasChanges && !hasImages)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-app-gold text-white text-sm font-medium hover:bg-app-gold/80 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                保存
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
