'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';

interface Subject {
  id: string;
  name: string;
  nameKo: string;
  order: number;
}

interface InstructorSubject {
  id: string;
  subjectId: string;
  subject: Subject;
}

interface Instructor {
  id: string;
  name: string;
  subjects: InstructorSubject[];
  image: string | null;
  intro: string | null;
  profile: string | null;
  curriculum: string | null;
  musicGenres: string | null;
  recommendedAlbums: string | null;
  messageToStudents: string | null;
  videoUrl1: string | null;
  videoUrl2: string | null;
  isActive: boolean;
  order: number;
}

function DraggableGrid({
  items,
  onReorder,
  onEdit,
  onDelete,
}: {
  items: Instructor[];
  onReorder: (items: Instructor[]) => void;
  onEdit: (instructor: Instructor) => void;
  onDelete: (id: string) => void;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    const reorderedItems = newItems.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    onReorder(reorderedItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
      }}
    >
      {items.map((instructor, index) => (
        <div
          key={instructor.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: dragOverIndex === index ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
            opacity: draggedIndex === index ? 0.5 : 1,
            cursor: 'grab',
            transition: 'box-shadow 0.2s, transform 0.2s',
            transform: dragOverIndex === index ? 'scale(1.02)' : 'scale(1)',
            border: dragOverIndex === index ? '2px solid #3b82f6' : '2px solid transparent',
          }}
        >
          <div
            style={{ position: 'relative', aspectRatio: '3/4', backgroundColor: '#f5f5f5', cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(instructor);
            }}
          >
            {instructor.image ? (
              <Image
                src={instructor.image}
                alt={instructor.name}
                fill
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                  fontSize: '48px',
                }}
              >
                👤
              </div>
            )}
            {!instructor.isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}
              >
                비활성
              </div>
            )}
            <div
              style={{
                position: 'absolute',
                top: '8px',
                left: '8px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
              }}
            >
              ⋮⋮
            </div>
          </div>
          <div style={{ padding: '16px' }}>
            <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              {instructor.name}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(instructor);
                }}
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
                수정
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(instructor.id);
                }}
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
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subjectIds: [] as string[],
    image: '',
    intro: '',
    profile: '',
    curriculum: '',
    musicGenres: '',
    recommendedAlbums: '',
    messageToStudents: '',
    videoUrl1: '',
    videoUrl2: '',
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [instructorsRes, subjectsRes] = await Promise.all([
      fetch('/api/admin/instructors'),
      fetch('/api/admin/subjects'),
    ]);
    const instructorsData = await instructorsRes.json();
    const subjectsData = await subjectsRes.json();
    setInstructors(instructorsData);
    setSubjects(subjectsData);
    setIsLoading(false);
  };

  const openModal = (instructor?: Instructor) => {
    if (instructor) {
      setEditingInstructor(instructor);
      setFormData({
        name: instructor.name,
        subjectIds: instructor.subjects.map(s => s.subjectId),
        image: instructor.image || '',
        intro: instructor.intro || '',
        profile: instructor.profile || '',
        curriculum: instructor.curriculum || '',
        musicGenres: instructor.musicGenres || '',
        recommendedAlbums: instructor.recommendedAlbums || '',
        messageToStudents: instructor.messageToStudents || '',
        videoUrl1: instructor.videoUrl1 || '',
        videoUrl2: instructor.videoUrl2 || '',
        isActive: instructor.isActive,
        order: instructor.order,
      });
    } else {
      setEditingInstructor(null);
      setFormData({
        name: '',
        subjectIds: [],
        image: '',
        intro: '',
        profile: '',
        curriculum: '',
        musicGenres: '',
        recommendedAlbums: '',
        messageToStudents: '',
        videoUrl1: '',
        videoUrl2: '',
        isActive: true,
        order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInstructor(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingInstructor
      ? `/api/admin/instructors/${editingInstructor.id}`
      : '/api/admin/instructors';
    const method = editingInstructor ? 'PATCH' : 'POST';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    closeModal();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    await fetch(`/api/admin/instructors/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleReorder = async (subjectName: string, reorderedItems: Instructor[]) => {
    // Update local state
    const newInstructors = instructors.map((instructor) => {
      const updated = reorderedItems.find((item) => item.id === instructor.id);
      return updated || instructor;
    });
    setInstructors(newInstructors);

    // Save to server
    await fetch('/api/admin/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'instructors',
        items: reorderedItems.map((item) => ({ id: item.id, order: item.order })),
      }),
    });
  };

  // 강사를 전공별로 그룹화 (한 강사가 여러 전공에 나타날 수 있음)
  // 강사가 아직 없는 전공도 섹션 자체는 보여서 관리자가 등록할 수 있어야 하므로
  // 빈 그룹을 필터링하지 않는다.
  const groupedInstructors = subjects.reduce((acc, subject) => {
    const subjectInstructors = instructors.filter(instructor =>
      instructor.subjects.some(s => s.subjectId === subject.id)
    );
    acc[subject.nameKo] = subjectInstructors;
    return acc;
  }, {} as Record<string, Instructor[]>);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '60px' }}>로딩중...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700 }}>강사 관리</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            href="/admin/instructors/main-page"
            style={{
              padding: '12px 24px',
              backgroundColor: '#ffc50a',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            메인페이지 순서 설정
          </Link>
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
            + 강사 추가
          </button>
        </div>
      </div>

      {Object.entries(groupedInstructors).map(([subjectName, subjectInstructors]) => (
        <div key={subjectName} style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#333' }}>
              {subjectName}
            </h2>
            <span style={{ fontSize: '12px', color: '#999' }}>
              (드래그하여 순서 변경)
            </span>
          </div>
          <DraggableGrid
            items={subjectInstructors.sort((a, b) => a.order - b.order)}
            onReorder={(items) => handleReorder(subjectName, items)}
            onEdit={openModal}
            onDelete={handleDelete}
          />
        </div>
      ))}

      {instructors.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          backgroundColor: '#fff',
          borderRadius: '12px',
        }}>
          <p style={{ color: '#999', marginBottom: '16px' }}>등록된 강사가 없습니다.</p>
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
            첫 강사 등록하기
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              overflow: 'hidden',
            }}
          >
            {/* 헤더 (고정) */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
                {editingInstructor ? '강사 수정' : '강사 추가'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#f5f5f5',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e5e5'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 스크롤 가능한 콘텐츠 영역 */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 32px',
            }}>
            <form id="instructor-form" onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                  이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                  전공 * (복수 선택 가능)
                </label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa',
                }}>
                  {subjects.map((subject) => {
                    const isSelected = formData.subjectIds.includes(subject.id);
                    return (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              subjectIds: formData.subjectIds.filter(id => id !== subject.id),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              subjectIds: [...formData.subjectIds, subject.id],
                            });
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          border: isSelected ? '2px solid #3b82f6' : '1px solid #ddd',
                          backgroundColor: isSelected ? '#eff6ff' : '#fff',
                          color: isSelected ? '#3b82f6' : '#666',
                          fontSize: '13px',
                          fontWeight: isSelected ? 600 : 400,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {isSelected && '✓ '}{subject.nameKo}
                      </button>
                    );
                  })}
                </div>
                {formData.subjectIds.length === 0 && (
                  <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
                    최소 1개 이상의 전공을 선택해주세요
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                  프로필 이미지
                </label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  folder="instructors"
                  aspectRatio="3/4"
                  placeholder="강사 사진 업로드"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                  자기소개
                </label>
                <textarea
                  value={formData.intro}
                  onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                  rows={3}
                  placeholder="강사님의 자기소개를 입력하세요"
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
                  프로필
                </label>
                <textarea
                  value={formData.profile}
                  onChange={(e) => setFormData({ ...formData, profile: e.target.value })}
                  rows={4}
                  placeholder="학력, 경력 등 프로필 정보&#10;- 항목 1&#10;- 항목 2"
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
                  커리큘럼
                </label>
                <textarea
                  value={formData.curriculum}
                  onChange={(e) => setFormData({ ...formData, curriculum: e.target.value })}
                  rows={4}
                  placeholder="수업 커리큘럼 및 방식&#10;- 항목 1&#10;- 항목 2"
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
                  추구하는 음악장르
                </label>
                <textarea
                  value={formData.musicGenres}
                  onChange={(e) => setFormData({ ...formData, musicGenres: e.target.value })}
                  rows={2}
                  placeholder="뮤지컬, 가요, Pop, Jazz, R&B 등"
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
                  추천음반리스트
                </label>
                <textarea
                  value={formData.recommendedAlbums}
                  onChange={(e) => setFormData({ ...formData, recommendedAlbums: e.target.value })}
                  rows={3}
                  placeholder="추천 음반 목록&#10;- 아티스트 - 앨범명&#10;- 아티스트 - 앨범명"
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
                  레슨생분들께 드리는 말씀
                </label>
                <textarea
                  value={formData.messageToStudents}
                  onChange={(e) => setFormData({ ...formData, messageToStudents: e.target.value })}
                  rows={3}
                  placeholder="레슨생에게 전하고 싶은 메시지"
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
                  영상 URL 1 (YouTube)
                </label>
                <input
                  type="text"
                  value={formData.videoUrl1}
                  onChange={(e) => setFormData({ ...formData, videoUrl1: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
                  영상 URL 2 (YouTube)
                </label>
                <input
                  type="text"
                  value={formData.videoUrl2}
                  onChange={(e) => setFormData({ ...formData, videoUrl2: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
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

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span style={{ fontSize: '14px' }}>활성화 (사이트에 표시)</span>
                </label>
              </div>
            </form>
            </div>

            {/* 푸터 (고정) */}
            <div style={{
              padding: '20px 32px',
              borderTop: '1px solid #eee',
              display: 'flex',
              gap: '12px',
              flexShrink: 0,
              backgroundColor: '#fff',
            }}>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#f5f5f5',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e5e5'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
              >
                취소
              </button>
              <button
                type="submit"
                form="instructor-form"
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#000'}
              >
                {editingInstructor ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
