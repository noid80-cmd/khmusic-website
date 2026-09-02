'use client';

import { useState, useEffect } from 'react';

interface AdmissionGuide {
  id: string;
  university: string;
  department: string | null;
  category: 'UNIVERSITY_4YR' | 'UNIVERSITY_2YR' | 'ART_HIGHSCHOOL' | 'GRADUATE';
  year: number;
  content: string;
  deadline: string | null;
  examDate: string | null;
  requirements: string | null;
  documents: string | null;
  examContent: string | null;
  link: string | null;
  isPublished: boolean;
  order: number;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  UNIVERSITY_4YR: '4년제 대학',
  UNIVERSITY_2YR: '전문대학',
  ART_HIGHSCHOOL: '예술고등학교',
  GRADUATE: '대학원',
};

interface AuditIssue {
  guideId: string;
  university: string;
  department: string | null;
  year: number;
  severity: 'error' | 'warning';
  message: string;
}

interface AuditResult {
  checked: number;
  errors: number;
  warnings: number;
  issues: AuditIssue[];
}

/**
 * 점검 결과.
 *
 * "오류 0건"이 요강이 다 맞다는 뜻은 아니다. 앞뒤가 안 맞는 것만 걸러낸 것이고,
 * 원본 대조는 사람이 해야 한다. 그래서 그 한계를 화면에 같이 적어 둔다.
 */
function AuditPanel({ audit, onClose }: { audit: AuditResult; onClose: () => void }) {
  const errors = audit.issues.filter((i) => i.severity === 'error');
  const warnings = audit.issues.filter((i) => i.severity === 'warning');

  const row = (i: AuditIssue, idx: number) => (
    <li key={`${i.guideId}-${idx}`} style={{ marginBottom: '6px', lineHeight: 1.55 }}>
      <strong style={{ fontWeight: 600 }}>
        {i.university}
        {i.department ? ` ${i.department}` : ''}
      </strong>
      <span style={{ color: '#666' }}> — {i.message}</span>
    </li>
  );

  return (
    <div
      style={{
        marginBottom: '24px',
        padding: '18px 20px',
        border: '1px solid #e2e2e2',
        borderRadius: '8px',
        background: '#fafafa',
        fontSize: '13.5px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <strong style={{ fontSize: '15px' }}>
          {audit.checked}건 점검 · 오류 {audit.errors} · 확인 {audit.warnings}
        </strong>
        <button
          onClick={onClose}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#888' }}
        >
          닫기
        </button>
      </div>

      {errors.length > 0 && (
        <>
          <p style={{ fontWeight: 600, color: '#c0392b', margin: '12px 0 6px' }}>
            오류 — 값 자체가 앞뒤가 안 맞습니다
          </p>
          <ul style={{ paddingLeft: '18px' }}>{errors.map(row)}</ul>
        </>
      )}

      {warnings.length > 0 && (
        <>
          <p style={{ fontWeight: 600, color: '#8a6d1f', margin: '12px 0 6px' }}>
            확인 — 사람이 봐야 합니다
          </p>
          <ul style={{ paddingLeft: '18px' }}>{warnings.map(row)}</ul>
        </>
      )}

      {audit.issues.length === 0 && (
        <p style={{ color: '#2d7a3e', margin: '8px 0' }}>걸린 항목이 없습니다.</p>
      )}

      <p style={{ marginTop: '14px', color: '#999', fontSize: '12.5px', lineHeight: 1.6 }}>
        이 점검은 요강끼리 앞뒤가 맞는지만 봅니다. 날짜가 대학 발표와 같은지는 확인하지
        못하므로, 오류가 없다고 해서 요강이 정확하다는 뜻은 아닙니다.
      </p>
    </div>
  );
}

export default function AdmissionGuidesPage() {
  const [guides, setGuides] = useState<AdmissionGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<AdmissionGuide | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [auditing, setAuditing] = useState(false);
  const [audit, setAudit] = useState<AuditResult | null>(null);

  async function runAudit() {
    setAuditing(true);
    try {
      const res = await fetch('/api/admin/admission-guides/audit');
      if (!res.ok) throw new Error(String(res.status));
      setAudit(await res.json());
    } catch {
      alert('점검에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setAuditing(false);
    }
  }
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    university: '',
    department: '',
    category: 'UNIVERSITY_4YR' as AdmissionGuide['category'],
    year: currentYear + 1,
    content: '',
    deadline: '',
    examDate: '',
    requirements: '',
    documents: '',
    examContent: '',
    link: '',
    order: 0,
    isPublished: true,
  });

  useEffect(() => {
    fetchGuides();
  }, [selectedCategory]);

  const fetchGuides = async () => {
    setIsLoading(true);
    const url = selectedCategory
      ? `/api/admin/admission-guides?category=${selectedCategory}`
      : '/api/admin/admission-guides';
    const res = await fetch(url);
    const data = await res.json();
    setGuides(data);
    setIsLoading(false);
  };

  const openModal = (guide?: AdmissionGuide) => {
    if (guide) {
      setEditingGuide(guide);
      setFormData({
        university: guide.university,
        department: guide.department || '',
        category: guide.category,
        year: guide.year,
        content: guide.content,
        deadline: guide.deadline || '',
        examDate: guide.examDate || '',
        requirements: guide.requirements || '',
        documents: guide.documents || '',
        examContent: guide.examContent || '',
        link: guide.link || '',
        order: guide.order,
        isPublished: guide.isPublished,
      });
    } else {
      setEditingGuide(null);
      setFormData({
        university: '',
        department: '',
        category: (selectedCategory as AdmissionGuide['category']) || 'UNIVERSITY_4YR',
        year: currentYear + 1,
        content: '',
        deadline: '',
        examDate: '',
        requirements: '',
        documents: '',
        examContent: '',
        link: '',
        order: 0,
        isPublished: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGuide(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingGuide
      ? `/api/admin/admission-guides/${editingGuide.id}`
      : '/api/admin/admission-guides';
    const method = editingGuide ? 'PATCH' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    closeModal();
    fetchGuides();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    await fetch(`/api/admin/admission-guides/${id}`, { method: 'DELETE' });
    fetchGuides();
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>로딩중...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>입시요강 관리</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={runAudit}
            disabled={auditing}
            style={{
              padding: '12px 20px',
              backgroundColor: '#fff',
              color: '#111',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: auditing ? 'default' : 'pointer',
            }}
          >
            {auditing ? '점검 중...' : '오류 점검'}
          </button>
          <button
            onClick={() => openModal()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + 입시요강 추가
          </button>
        </div>
      </div>

      {audit && <AuditPanel audit={audit} onClose={() => setAudit(null)} />}

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedCategory('')}
          style={{
            padding: '8px 16px',
            backgroundColor: selectedCategory === '' ? '#000' : '#f5f5f5',
            color: selectedCategory === '' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          전체
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            style={{
              padding: '8px 16px',
              backgroundColor: selectedCategory === key ? '#000' : '#f5f5f5',
              color: selectedCategory === key ? '#fff' : '#333',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Guides Table */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f8f8' }}>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '14px', fontWeight: 600 }}>대학명</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '14px', fontWeight: 600 }}>학과</th>
              <th style={{ textAlign: 'left', padding: '16px', fontSize: '14px', fontWeight: 600 }}>구분</th>
              <th style={{ textAlign: 'center', padding: '16px', fontSize: '14px', fontWeight: 600 }}>연도</th>
              <th style={{ textAlign: 'center', padding: '16px', fontSize: '14px', fontWeight: 600 }}>상태</th>
              <th style={{ textAlign: 'center', padding: '16px', fontSize: '14px', fontWeight: 600 }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {guides.map((guide) => (
              <tr key={guide.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>
                  {guide.university}
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>
                  {guide.department || '-'}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}>
                    {categoryLabels[guide.category]}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px' }}>
                  {guide.year}
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    backgroundColor: guide.isPublished ? '#dcfce7' : '#fef2f2',
                    color: guide.isPublished ? '#16a34a' : '#dc2626',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}>
                    {guide.isPublished ? '공개' : '비공개'}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => openModal(guide)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f5f5f5',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(guide.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {guides.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px',
          }}>
            <p style={{ color: '#999', marginBottom: '16px' }}>등록된 입시요강이 없습니다.</p>
            <button
              onClick={() => openModal()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              첫 입시요강 등록하기
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
              {editingGuide ? '입시요강 수정' : '입시요강 추가'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                    대학명 *
                  </label>
                  <input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                    required
                    placeholder="예: 서울예술대학교"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                    학과
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="예: 실용음악과"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                    구분 *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AdmissionGuide['category'] })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="UNIVERSITY_4YR">4년제 대학</option>
                    <option value="UNIVERSITY_2YR">전문대학</option>
                    <option value="ART_HIGHSCHOOL">예술고등학교</option>
                    <option value="GRADUATE">대학원</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                    입시 연도 *
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || currentYear })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                    원서 마감
                  </label>
                  <input
                    type="text"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    placeholder="예: 2025.09.01 ~ 09.05"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                    실기 일정
                  </label>
                  <input
                    type="text"
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    placeholder="예: 2025.10.15"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                  요강 내용 *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={4}
                  placeholder="주요 입시 요강 내용을 입력하세요"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                  지원 자격
                </label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                  실기 내용
                </label>
                <textarea
                  value={formData.examContent}
                  onChange={(e) => setFormData({ ...formData, examContent: e.target.value })}
                  rows={3}
                  placeholder="예: 자유곡 1곡, 시창/청음 등"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                  제출 서류
                </label>
                <textarea
                  value={formData.documents}
                  onChange={(e) => setFormData({ ...formData, documents: e.target.value })}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                  대학 원서 링크
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  />
                  <span style={{ fontSize: '14px' }}>공개 (사이트에 표시)</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {editingGuide ? '수정' : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
