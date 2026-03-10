'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { api, MediaFile } from '@/lib/api';
import { Upload, Copy, Check, Image, Film, Music, Trash2, FolderOpen } from 'lucide-react';

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return ''; }
}

type Filter = 'ALL' | 'IMAGE' | 'VIDEO' | 'AUDIO';

export default function AdminMedia() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [copied, setCopied] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await api.adminGetMedia();
      setFiles(data);
    } catch {}
    setLoading(false);
  };

  const uploadFiles = useCallback(async (fileList: File[]) => {
    if (!fileList.length) return;
    setUploading(true);
    setUploadProgress([]);

    const results: MediaFile[] = [];
    for (const file of fileList) {
      setUploadProgress(prev => [...prev, `Uploading ${file.name}...`]);
      try {
        const uploaded = await api.adminUploadMedia(file);
        results.push(uploaded);
        setUploadProgress(prev =>
          prev.map(p => p.includes(file.name) ? `✓ ${file.name}` : p)
        );
      } catch {
        setUploadProgress(prev =>
          prev.map(p => p.includes(file.name) ? `✗ ${file.name} (failed)` : p)
        );
      }
    }

    // Refresh full list from server
    await loadFiles();
    setUploading(false);
    setTimeout(() => setUploadProgress([]), 3000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    uploadFiles(selected);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    // Only set false if leaving the drop zone entirely
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setDragging(false);
    }
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      f.type.startsWith('image/') || f.type.startsWith('video/') || f.type.startsWith('audio/')
    );
    if (dropped.length) uploadFiles(dropped);
  };

  const copyUrl = (file: MediaFile) => {
    navigator.clipboard.writeText(`http://localhost:8801${file.url}`).catch(() => {});
    setCopied(file.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = filter === 'ALL' ? files : files.filter(f => f.fileType === filter);

  const counts = {
    ALL: files.length,
    IMAGE: files.filter(f => f.fileType === 'IMAGE').length,
    VIDEO: files.filter(f => f.fileType === 'VIDEO').length,
    AUDIO: files.filter(f => f.fileType === 'AUDIO').length,
  };

  const filterIcons: Record<Filter, React.ReactNode> = {
    ALL: null,
    IMAGE: <Image size={12} />,
    VIDEO: <Film size={12} />,
    AUDIO: <Music size={12} />,
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#0a0a0a]">Media Library</h1>
          <p className="text-sm text-[#9b9b9b] mt-0.5">{files.length} file{files.length !== 1 ? 's' : ''}</p>
        </div>
        {/* Upload button — opens file picker */}
        <label className="flex items-center gap-2 bg-[#0a0a0a] text-white px-4 py-2.5 text-sm font-medium hover:bg-[#333] cursor-pointer transition-colors">
          <FolderOpen size={15} />
          Choose Files
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </label>
      </div>

      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded transition-all cursor-pointer mb-6
          flex flex-col items-center justify-center py-10 gap-3
          ${dragging
            ? 'border-[#0a0a0a] bg-[#f0f0ee] scale-[1.01]'
            : 'border-[#e5e5e3] hover:border-[#9b9b9b] hover:bg-[#f9f9f7]'
          }
        `}
      >
        <Upload size={28} className={dragging ? 'text-[#0a0a0a]' : 'text-[#9b9b9b]'} />
        <div className="text-center">
          <p className={`text-sm font-medium ${dragging ? 'text-[#0a0a0a]' : 'text-[#6b6b6b]'}`}>
            {dragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-xs text-[#9b9b9b] mt-1">
            or <span className="underline">click to browse</span> your computer
          </p>
          <p className="text-xs text-[#b0b0b0] mt-1">Images, videos, audio files</p>
        </div>
      </div>

      {/* Upload progress */}
      {uploadProgress.length > 0 && (
        <div className="mb-6 border border-[#e5e5e3] p-4 space-y-1">
          {uploadProgress.map((msg, i) => (
            <p key={i} className={`text-xs font-mono ${
              msg.startsWith('✓') ? 'text-green-700' :
              msg.startsWith('✗') ? 'text-red-600' :
              'text-[#6b6b6b]'
            }`}>
              {msg}
            </p>
          ))}
        </div>
      )}

      {/* Uploading indicator */}
      {uploading && (
        <div className="mb-4 flex items-center gap-2 text-sm text-[#6b6b6b]">
          <div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
          Uploading...
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['ALL', 'IMAGE', 'VIDEO', 'AUDIO'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-[#0a0a0a] text-white'
                : 'border border-[#e5e5e3] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#0a0a0a]'
            }`}
          >
            {filterIcons[f]}
            {f} {counts[f] > 0 && <span className="opacity-60">({counts[f]})</span>}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <p className="text-sm text-[#9b9b9b]">Loading media...</p>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-[#e5e5e3] p-16 text-center">
          <p className="text-sm text-[#9b9b9b]">
            {filter === 'ALL' ? 'No files yet. Upload something above.' : `No ${filter.toLowerCase()} files.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(file => (
            <div key={file.id} className="border border-[#e5e5e3] group">

              {/* Preview */}
              <div className="aspect-video bg-[#f5f5f3] flex items-center justify-center overflow-hidden">
                {file.fileType === 'IMAGE' && (
                  <img
                    src={`http://localhost:8801${file.url}`}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                  />
                )}
                {file.fileType === 'VIDEO' && (
                  <video
                    src={`http://localhost:8801${file.url}`}
                    className="w-full h-full object-cover"
                  />
                )}
                {file.fileType === 'AUDIO' && (
                  <div className="flex flex-col items-center gap-2">
                    <Music size={24} className="text-[#9b9b9b]" />
                    <span className="text-xs text-[#9b9b9b]">Audio</span>
                  </div>
                )}
              </div>

              {/* Info + actions */}
              <div className="p-2.5">
                <p
                  className="text-xs text-[#0a0a0a] truncate font-medium mb-0.5"
                  title={file.originalName}
                >
                  {file.originalName}
                </p>
                <p className="text-xs text-[#9b9b9b]">
                  {formatBytes(file.fileSize)} · {formatDate(file.createdAt)}
                </p>

                {/* Copy URL button */}
                <button
                  onClick={() => copyUrl(file)}
                  className={`mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium border transition-colors ${
                    copied === file.id
                      ? 'border-green-300 text-green-700 bg-green-50'
                      : 'border-[#e5e5e3] text-[#6b6b6b] hover:border-[#0a0a0a] hover:text-[#0a0a0a]'
                  }`}
                >
                  {copied === file.id ? <Check size={11} /> : <Copy size={11} />}
                  {copied === file.id ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage tip */}
      {files.length > 0 && (
        <p className="text-xs text-[#9b9b9b] mt-8 text-center">
          Copy a URL then paste it into the Image / Video / Audio button in the article editor.
        </p>
      )}
    </div>
  );
}
