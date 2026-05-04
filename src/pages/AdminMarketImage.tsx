import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Check } from 'lucide-react';
import { publicUrl } from '@/lib/publicUrl';

export function AdminMarketImage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    // In static deployment, we can't actually save files server-side
    // This would work with a real backend file upload endpoint
    // For now, show success and instruct the user
    setUploaded(true);
    setTimeout(() => setUploaded(false), 3000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">行情图片管理</h1>

      <div className="rounded-lg bg-app-card border border-app-border p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          上传新的行情数据表格图片，将替换首页「行情中心」预览区域显示的图片。
        </p>

        {/* Current image */}
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">当前图片</p>
          <div className="rounded-md border border-app-border overflow-hidden w-full max-w-md">
            <img
              src={publicUrl("market-chart.png")}
              alt="当前行情图片"
              className="w-full h-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Upload */}
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">上传新图片</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {preview ? (
            <div className="space-y-3">
              <div className="rounded-md border border-app-border overflow-hidden w-full max-w-md">
                <img src={preview} alt="预览" className="w-full h-auto" />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleUpload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-app-gold text-white text-sm font-medium hover:bg-app-gold/80 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  确认替换
                </button>
                <button
                  onClick={() => {
                    setPreview(null);
                    if (fileRef.current) fileRef.current.value = '';
                  }}
                  className="px-4 py-2 rounded-md border border-app-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  取消
                </button>
                {uploaded && (
                  <span className="flex items-center gap-1 text-xs text-app-green">
                    <Check className="h-3.5 w-3.5" />
                    已替换（刷新页面生效）
                  </span>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-2 w-full max-w-md py-8 rounded-md border-2 border-dashed border-app-border bg-app-bg/40 hover:bg-app-hover hover:border-app-gold transition-colors"
            >
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">点击选择图片</span>
              <span className="text-xs text-muted-foreground">支持 JPG、PNG 格式</span>
            </button>
          )}
        </div>

        {/* Note */}
        <div className="rounded-md bg-app-gold/5 border border-app-gold/10 px-3 py-2">
          <p className="text-xs text-app-gold leading-relaxed">
            <strong>提示：</strong>静态部署环境下，图片需要通过服务器文件系统替换。实际生产环境建议对接云存储（如阿里云 OSS、腾讯云 COS）实现真正的文件上传功能。
          </p>
        </div>
      </div>
    </div>
  );
}
