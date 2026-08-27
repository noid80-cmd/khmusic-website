'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  aspectRatio?: string;
  placeholder?: string;
  compact?: boolean;
}

// Vercel 서버리스 함수의 요청 본문 한도는 4.5MB다. 그 한도를 넘으면 요청이
// 핸들러에 닿기도 전에 Vercel이 JSON이 아닌 평문 413을 돌려주므로,
// 업로드 전에 브라우저에서 미리 줄인다. (요즘 폰 사진은 대부분 이 한도를 넘는다)
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_DIMENSION = 1920;
const COMPRESS_OVER_BYTES = 1.5 * 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지를 읽을 수 없습니다.')); };
    img.src = url;
  });
}

async function compressImage(file: File): Promise<File> {
  // GIF는 캔버스를 거치면 애니메이션이 사라진다
  if (file.type === 'image/gif') return file;
  if (file.size <= COMPRESS_OVER_BYTES) return file;

  try {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // webp는 투명도를 유지하므로 PNG 로고를 올려도 배경이 검게 변하지 않는다
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.85)
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
  } catch {
    return file; // 줄이는 데 실패하면 원본 그대로 시도한다
  }
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'images',
  aspectRatio = '1/1',
  placeholder = '이미지 업로드',
  compact = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (rawFile: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const file = await compressImage(rawFile);

      if (file.size > MAX_UPLOAD_BYTES) {
        const mb = (file.size / 1024 / 1024).toFixed(1);
        throw new Error(`이미지 용량이 너무 큽니다 (${mb}MB). 4MB 이하로 줄여서 올려주세요.`);
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      // 413처럼 Vercel이 직접 돌려주는 응답은 JSON이 아니다.
      // 곧바로 res.json()을 부르면 파싱 오류가 진짜 원인을 가린다.
      const text = await res.text();
      let data: { url?: string; error?: string };
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          res.status === 413
            ? '이미지 용량이 너무 커서 업로드하지 못했습니다. 더 작은 파일로 올려주세요.'
            : `업로드 실패 (${res.status}). 잠시 후 다시 시도해주세요.`
        );
      }

      if (!res.ok) {
        throw new Error(data.error || `업로드 실패 (${res.status})`);
      }

      onChange(data.url!);
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 실패');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    } else {
      setError('이미지 파일만 업로드 가능합니다.');
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {value ? (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'relative',
              aspectRatio,
              borderRadius: compact ? '6px' : '8px',
              overflow: 'hidden',
              backgroundColor: '#f5f5f5',
            }}
          >
            <Image
              src={value}
              alt="업로드된 이미지"
              fill
              style={{ objectFit: 'cover' }}
            />
            {compact && (
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '18px',
                  height: '18px',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  fontSize: '12px',
                  lineHeight: '1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            )}
          </div>
          {!compact && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                변경
              </button>
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                삭제
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            aspectRatio,
            border: `2px dashed ${dragActive ? '#3b82f6' : '#ddd'}`,
            borderRadius: compact ? '6px' : '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backgroundColor: dragActive ? '#eff6ff' : '#fafafa',
            transition: 'all 0.2s',
          }}
        >
          {isUploading ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: compact ? '20px' : '32px',
                  height: compact ? '20px' : '32px',
                  border: '3px solid #e5e7eb',
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: compact ? '0 auto' : '0 auto 8px',
                }}
              />
              {!compact && <p style={{ fontSize: '13px', color: '#666' }}>업로드 중...</p>}
            </div>
          ) : (
            <>
              <svg
                width={compact ? '24' : '40'}
                height={compact ? '24' : '40'}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#999"
                strokeWidth="1.5"
                style={{ marginBottom: compact ? '0' : '8px' }}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17,8 12,3 7,8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {!compact && (
                <>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                    {placeholder}
                  </p>
                  <p style={{ fontSize: '12px', color: '#999' }}>
                    클릭하거나 파일을 드래그하세요
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}

      {error && (
        <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px' }}>
          {error}
        </p>
      )}

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
