'use client';

import { useState, useEffect } from 'react';

/**
 * 칼럼 소재 관리.
 *
 * 요강에는 없지만 아는 사람만 아는 것들을 여기 쌓는다. 자동 생성 칼럼이 이걸
 * 소재로 써서, 요강을 옮겨 적은 글과 갈라진다. 쌓일수록 글이 좋아진다.
 */

interface Insight {
  id: string;
  title: string;
  detail: string;
  caution: string | null;
  schools: string | null;
  isActive: boolean;
  order: number;
}

const EMPTY = { title: '', detail: '', caution: '', schools: '', isActive: true, order: 0 };

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  async function fetchInsights() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/insights');
      const data = await res.json();
      setInsights(data.insights ?? []);
    } catch {
      alert('목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setForm(EMPTY);
    setEditing('new');
  }

  function openEdit(i: Insight) {
    setForm({
      title: i.title,
      detail: i.detail,
      caution: i.caution ?? '',
      schools: i.schools ?? '',
      isActive: i.isActive,
      order: i.order,
    });
    setEditing(i.id);
  }

  async function save() {
    if (!form.title.trim() || !form.detail.trim()) {
      alert('제목과 설명은 반드시 입력해 주세요.');
      return;
    }
    setSaving(true);
    try {
      const isNew = editing === 'new';
      const res = await fetch(isNew ? '/api/admin/insights' : `/api/admin/insights/${editing}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? '저장에 실패했습니다.');
        return;
      }
      setEditing(null);
      fetchInsights();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(i: Insight) {
    await fetch(`/api/admin/insights/${i.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !i.isActive }),
    });
    fetchInsights();
  }

  async function remove(i: Insight) {
    if (!confirm(`"${i.title}"\n\n이 소재를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    await fetch(`/api/admin/insights/${i.id}`, { method: 'DELETE' });
    fetchInsights();
  }

  const label: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '6px',
  };
  const input: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    lineHeight: 1.6,
  };
  const btn: React.CSSProperties = {
    padding: '7px 13px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    background: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '10px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700 }}>칼럼 소재</h1>
          <p style={{ fontSize: '14px', color: '#777', marginTop: '8px', lineHeight: 1.65 }}>
            요강에는 안 적혀 있지만 학생이 모르면 손해 보는 것들을 여기 쌓아 주세요.
            <br />
            자동 생성되는 입시 칼럼이 이걸 소재로 씁니다. 쌓일수록 글이 좋아집니다.
          </p>
        </div>
        <button
          onClick={openNew}
          style={{
            padding: '12px 24px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            flex: 'none',
          }}
        >
          + 소재 추가
        </button>
      </div>

      {editing && (
        <div
          style={{
            margin: '24px 0',
            padding: '22px',
            border: '1px solid #e2e2e2',
            borderRadius: '8px',
            background: '#fafafa',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <label style={label}>제목 — 한 줄로 요약</label>
            <input
              style={input}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="예: 실용음악학부 안에서 전공 간 중복지원이 된다"
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={label}>설명 — 왜 중요한지, 학생이 뭘 놓치는지</label>
            <textarea
              style={{ ...input, minHeight: '140px', resize: 'vertical' }}
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              placeholder={
                '아는 사람에게 설명하듯 편하게 쓰셔도 됩니다. 글은 이 내용을 바탕으로 다시 쓰여집니다.\n' +
                '학생이 무엇을 오해하는지, 그래서 무엇이 달라지는지를 적어 주시면 좋습니다.'
              }
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={label}>
              해당 학교 — 쉼표로 구분. <span style={{ fontWeight: 400, color: '#888' }}>비우면 모든 글에 쓰입니다</span>
            </label>
            <input
              style={input}
              value={form.schools}
              onChange={(e) => setForm({ ...form, schools: e.target.value })}
              placeholder="예: 백석예술대학교, 국제예술대학교, 정화예술대학교"
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={label}>
              함께 안내할 것{' '}
              <span style={{ fontWeight: 400, color: '#888' }}>
                — 해마다 바뀔 수 있는 내용이면 꼭 적어 주세요
              </span>
            </label>
            <textarea
              style={{ ...input, minHeight: '70px', resize: 'vertical' }}
              value={form.caution}
              onChange={(e) => setForm({ ...form, caution: e.target.value })}
              placeholder="예: 등록 포기 절차와 기한은 반드시 대학 공식 발표에서 확인해야 한다."
            />
            <p style={{ fontSize: '12.5px', color: '#999', marginTop: '7px', lineHeight: 1.6 }}>
              여기 적은 내용은 이 소재가 쓰인 글에 반드시 함께 나갑니다. 규정이 바뀌었는데 글을
              그대로 믿은 학생이 생기지 않도록 하는 안전장치입니다.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={save}
              disabled={saving}
              style={{
                padding: '11px 22px',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: saving ? 'default' : 'pointer',
              }}
            >
              {saving ? '저장 중...' : '저장'}
            </button>
            <button onClick={() => setEditing(null)} style={{ ...btn, padding: '11px 22px' }}>
              취소
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p style={{ color: '#999', padding: '40px 0' }}>불러오는 중...</p>
      ) : insights.length === 0 ? (
        <p style={{ color: '#999', padding: '40px 0' }}>
          아직 소재가 없습니다. 첫 소재를 추가해 주세요.
        </p>
      ) : (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {insights.map((i) => (
            <div
              key={i.id}
              style={{
                padding: '16px 18px',
                border: '1px solid #eee',
                borderRadius: '8px',
                background: i.isActive ? '#fff' : '#fbfbfb',
                opacity: i.isActive ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>
                    {i.title}
                    {!i.isActive && (
                      <span style={{ marginLeft: '8px', fontSize: '11.5px', color: '#999' }}>
                        사용 안 함
                      </span>
                    )}
                  </p>
                  <p style={{ fontSize: '13.5px', color: '#666', lineHeight: 1.7 }}>{i.detail}</p>
                  {i.caution && (
                    <p style={{ fontSize: '12.5px', color: '#8a6d1f', marginTop: '8px', lineHeight: 1.6 }}>
                      함께 안내: {i.caution}
                    </p>
                  )}
                  <p style={{ fontSize: '12.5px', color: '#999', marginTop: '8px' }}>
                    {i.schools ? i.schools : '모든 글에 적용'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flex: 'none', alignItems: 'flex-start' }}>
                  <button onClick={() => openEdit(i)} style={btn}>
                    수정
                  </button>
                  <button onClick={() => toggleActive(i)} style={btn}>
                    {i.isActive ? '사용 안 함' : '사용'}
                  </button>
                  <button onClick={() => remove(i)} style={{ ...btn, color: '#c0392b' }}>
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
