'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ImageUpload from '@/components/admin/ImageUpload';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>에디터 로딩중...</div>
  ),
});

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: 'ADMISSION' | 'PRACTICE' | 'ACADEMY';
  keywords: string | null;
  sourceNote: string | null;
  naverDraft: string | null;
  isAutoDraft: boolean;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: string | null;
  createdAt: string;
}

const CATEGORIES = [
  { value: 'ADMISSION', label: '입시 정보' },
  { value: 'PRACTICE', label: '연습과 실기' },
  { value: 'ACADEMY', label: '학원 이야기' },
] as const;

const catLabel = (v: string) => CATEGORIES.find((c) => c.value === v)?.label ?? v;

const EMPTY = {
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: 'ADMISSION',
  keywords: '',
  sourceNote: '',
  naverDraft: '',
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
};

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');
  const [editing, setEditing] = useState<Post | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [copied, setCopied] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    const res = await fetch('/api/admin/blog');
    const data = await res.json();
    setPosts(data.posts || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY });
    setCopied(false);
    setIsOpen(true);
  };

  const openEdit = (p: Post) => {
    setEditing(p);
    setForm({
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.coverImage || '',
      category: p.category,
      keywords: p.keywords || '',
      sourceNote: p.sourceNote || '',
      naverDraft: p.naverDraft || '',
      status: p.status,
    });
    setCopied(false);
    setIsOpen(true);
  };

  const save = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!form.title.trim()) {
      alert('제목을 입력해 주세요.');
      return;
    }
    if (status === 'PUBLISHED' && !form.excerpt.trim()) {
      alert('요약을 입력해 주세요. 검색 결과에 표시되는 문장이라 게시 전에 꼭 필요합니다.');
      return;
    }

    setSaving(true);
    const body = { ...form, status };
    const res = editing
      ? await fetch(`/api/admin/blog/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      : await fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
    setSaving(false);

    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      alert(e.error || '저장에 실패했습니다.');
      return;
    }
    setIsOpen(false);
    fetchPosts();
  };

  const remove = async (p: Post) => {
    if (!confirm(`"${p.title}" 글을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    await fetch(`/api/admin/blog/${p.id}`, { method: 'DELETE' });
    fetchPosts();
  };

  const togglePublish = async (p: Post) => {
    const next = p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    if (next === 'PUBLISHED' && !p.excerpt.trim()) {
      alert('요약이 비어 있습니다. 글을 열어 요약을 채운 뒤 게시해 주세요.');
      return;
    }
    await fetch(`/api/admin/blog/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    fetchPosts();
  };

  const copyNaver = async () => {
    if (!form.naverDraft) return;
    try {
      await navigator.clipboard.writeText(form.naverDraft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('복사에 실패했습니다. 직접 선택해서 복사해 주세요.');
    }
  };

  const shown = posts.filter((p) => filter === 'ALL' || p.status === filter);
  const draftCount = posts.filter((p) => p.status === 'DRAFT').length;

  return (
    <div style={{ padding: '32px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '8px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '6px' }}>블로그</h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            입시 칼럼 글을 쓰고 게시합니다. 게시하면 khmusic.co.kr/blog 에 바로 올라갑니다.
          </p>
        </div>
        <button
          onClick={openNew}
          style={{
            padding: '11px 22px',
            background: '#111',
            color: '#fff',
            border: 0,
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          새 글 쓰기
        </button>
      </div>

      {draftCount > 0 && (
        <div
          style={{
            margin: '20px 0 0',
            padding: '13px 16px',
            background: '#fff8e1',
            border: '1px solid #ffe082',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#7a5d00',
          }}
        >
          검토를 기다리는 초안이 <b>{draftCount}건</b> 있습니다.{' '}
          <b>미리보기</b>로 실제 보이는 모습을 확인한 뒤 게시하거나 삭제해 주세요.
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', margin: '24px 0 18px' }}>
        {(['ALL', 'DRAFT', 'PUBLISHED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: '999px',
              border: '1px solid ' + (filter === f ? '#111' : '#ddd'),
              background: filter === f ? '#111' : '#fff',
              color: filter === f ? '#fff' : '#555',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {f === 'ALL' ? '전체' : f === 'DRAFT' ? '초안' : '게시됨'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p style={{ color: '#999', padding: '40px 0' }}>불러오는 중...</p>
      ) : shown.length === 0 ? (
        <p style={{ color: '#999', padding: '40px 0' }}>글이 없습니다.</p>
      ) : (
        <div style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
          {shown.map((p, i) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 18px',
                borderTop: i === 0 ? 0 : '1px solid #f0f0f0',
                background: p.status === 'DRAFT' ? '#fffdf5' : '#fff',
              }}
            >
              <span
                style={{
                  flex: 'none',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  background: p.status === 'PUBLISHED' ? '#111' : '#ffc50a',
                  color: p.status === 'PUBLISHED' ? '#fff' : '#111',
                }}
              >
                {p.status === 'PUBLISHED' ? '게시됨' : '초안'}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '15.5px', fontWeight: 600, marginBottom: '4px' }}>
                  {p.title}
                  {p.isAutoDraft && (
                    <span style={{ marginLeft: '8px', fontSize: '11.5px', color: '#888' }}>
                      자동 생성
                    </span>
                  )}
                </p>
                <p style={{ fontSize: '12.5px', color: '#999' }}>
                  {catLabel(p.category)} · /blog/{p.slug}
                  {p.publishedAt && ` · ${new Date(p.publishedAt).toLocaleDateString('ko-KR')}`}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px', flex: 'none' }}>
                <a
                  href={p.status === 'PUBLISHED' ? `/blog/${p.slug}` : `/blog/preview/${p.id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={p.status === 'PUBLISHED' ? btn : { ...btn, borderColor: '#111', color: '#111' }}
                >
                  {p.status === 'PUBLISHED' ? '보기' : '미리보기'}
                </a>
                <button onClick={() => openEdit(p)} style={btn}>
                  수정
                </button>
                <button onClick={() => togglePublish(p)} style={btn}>
                  {p.status === 'PUBLISHED' ? '내리기' : '게시'}
                </button>
                <button onClick={() => remove(p)} style={{ ...btn, color: '#c0392b' }}>
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '40px 20px',
            overflowY: 'auto',
            zIndex: 100,
          }}
          onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '10px',
              width: '100%',
              maxWidth: '860px',
              padding: '30px',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '22px' }}>
              {editing ? '글 수정' : '새 글'}
            </h2>

            <Field label="제목">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={input}
                placeholder="2027 서경대 실용음악과 수시, 보컬 2차는 왜 한글 가사곡일까"
              />
            </Field>

            <Field
              label="요약"
              hint="네이버·구글 검색 결과에 이 문장이 그대로 뜹니다. 두세 줄로 핵심을 담아 주세요."
            >
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                style={{ ...input, height: '72px', resize: 'vertical' }}
              />
            </Field>

            <div style={{ display: 'flex', gap: '14px' }}>
              <Field label="분류" style={{ flex: 1 }}>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={input}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="검색 키워드" hint="쉼표로 구분" style={{ flex: 2 }}>
                <input
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  style={input}
                  placeholder="서경대 실용음악과, 실용음악 입시, 보컬 실기"
                />
              </Field>
            </div>

            <Field
              label="대표 사진"
              hint="목록과 글 맨 위에 크게 들어갑니다. 카카오톡·네이버로 공유할 때 나오는 썸네일이기도 합니다. 가로로 긴 사진이 좋습니다."
            >
              <ImageUpload
                value={form.coverImage}
                onChange={(url) => setForm({ ...form, coverImage: url })}
                folder="blog"
                placeholder="대표 사진 올리기"
              />
            </Field>

            <Field label="본문" hint="글 중간에 사진을 넣으려면 편집기 위쪽의 사진 버튼을 쓰세요.">
              <RichTextEditor
                content={form.content}
                onChange={(html: string) => setForm({ ...form, content: html })}
              />
            </Field>

            <Field label="출처 표기" hint="글 맨 아래에 작은 글씨로 들어갑니다.">
              <input
                value={form.sourceNote}
                onChange={(e) => setForm({ ...form, sourceNote: e.target.value })}
                style={input}
                placeholder="출처: 서경대학교 2027학년도 수시 모집요강 · 본원 합격자 데이터"
              />
            </Field>

            <Field
              label="네이버 블로그용 버전"
              hint="네이버는 자동 등록이 안 됩니다. 복사해서 붙여넣으세요."
            >
              <textarea
                value={form.naverDraft}
                onChange={(e) => setForm({ ...form, naverDraft: e.target.value })}
                style={{ ...input, height: '140px', resize: 'vertical', lineHeight: 1.7 }}
              />
              {form.naverDraft && (
                <button
                  onClick={copyNaver}
                  style={{ ...btn, marginTop: '8px', background: copied ? '#111' : '#fff', color: copied ? '#fff' : '#333' }}
                >
                  {copied ? '복사됨' : '네이버용 본문 복사'}
                </button>
              )}
            </Field>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                marginTop: '26px',
                paddingTop: '20px',
                borderTop: '1px solid #eee',
              }}
            >
              <button onClick={() => setIsOpen(false)} style={{ ...btn, padding: '11px 20px' }}>
                취소
              </button>
              <button
                onClick={() => save('DRAFT')}
                disabled={saving}
                style={{ ...btn, padding: '11px 20px' }}
              >
                초안으로 저장
              </button>
              <button
                onClick={() => save('PUBLISHED')}
                disabled={saving}
                style={{
                  padding: '11px 24px',
                  background: '#111',
                  color: '#fff',
                  border: 0,
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                {saving ? '저장 중...' : '게시하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: '7px 13px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  background: '#fff',
  fontSize: '13px',
  fontWeight: 600,
  color: '#333',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'inline-block',
};

const input: React.CSSProperties = {
  width: '100%',
  padding: '11px 13px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14.5px',
  fontFamily: 'inherit',
};

function Field({
  label,
  hint,
  children,
  style,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ marginBottom: '20px', ...style }}>
      <label
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 700,
          marginBottom: '6px',
          color: '#333',
        }}
      >
        {label}
      </label>
      {hint && (
        <p style={{ fontSize: '12.5px', color: '#888', marginBottom: '8px', lineHeight: 1.5 }}>
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}
