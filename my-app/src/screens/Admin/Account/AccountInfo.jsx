import React, { useEffect, useMemo, useState } from 'react';
import { authAPI, uploadsAPI } from '../../../services/api';
import { ImageUploadField } from '../../../components';
import { ADMIN_AUTH_KEY } from '../../../utils/adminPermissions';
import { AvatarIcon } from '../../../SvgIcons';
import './AccountInfo.css';

export default function AccountInfo({ user }) {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    email: '',
    avatar_url: '',
    password: '',
    newPassword: '',
  });

  const activeProfile = useMemo(() => profile || user || null, [profile, user]);

  useEffect(() => {
    let mounted = true;

    async function fetchProfile() {
      setLoadingProfile(true);
      setErrorMessage('');
      try {
        const result = await authAPI.getMyProfile();
        if (!mounted) return;
        setProfile(result || null);
      } catch (err) {
        if (!mounted) return;
        setErrorMessage(err.message || 'Không thể tải thông tin tài khoản');
      } finally {
        if (mounted) {
          setLoadingProfile(false);
        }
      }
    }

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeProfile) return;
    setForm((prev) => ({
      ...prev,
      email: activeProfile?.email || '',
      avatar_url: activeProfile?.avatar_url || '',
      password: '',
      newPassword: '',
    }));
  }, [activeProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleEdit = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setEditMode(true);
    setPasswordMode(false);
  };

  const handlePasswordMode = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setEditMode(false);
    setPasswordMode(true);
    setForm(p => ({ ...p, password: '', newPassword: '' }));
  };

  const handleCancel = () => {
    setEditMode(false);
    setPasswordMode(false);
    setErrorMessage('');
    setSuccessMessage('');
    setForm({
      email: activeProfile?.email || '',
      avatar_url: activeProfile?.avatar_url || '',
      password: '',
      newPassword: '',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (form.password && !form.newPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu mới.');
      return;
    }
    if (!form.password && form.newPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    const originalEmail = (activeProfile?.email || '').trim();
    const originalAvatar = (activeProfile?.avatar_url || '').trim();
    const currentEmail = (form.email || '').trim();
    const currentAvatar = (form.avatar_url || '').trim();

    const hasProfileChanges = Boolean(
      originalEmail !== currentEmail
      || originalAvatar !== currentAvatar
    );
    const hasPasswordChange = Boolean(form.password && form.newPassword);

    if (!hasProfileChanges && !hasPasswordChange) {
      setSuccessMessage('Không có thay đổi để lưu.');
      return;
    }

    setSaving(true);
    try {
      let nextAvatarUrl = form.avatar_url || '';
      let updatedProfile = activeProfile;

      if (hasProfileChanges) {
        updatedProfile = await authAPI.updateMyProfile({
          email: currentEmail,
          avatar_url: nextAvatarUrl || null,
        });
      }

      if (hasPasswordChange) {
        await authAPI.changePassword({
          password: form.password,
          newPassword: form.newPassword,
        });
      }

      setProfile(updatedProfile);
      if (updatedProfile) {
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(updatedProfile));
      }
      setEditMode(false);
      setPasswordMode(false);
      setSuccessMessage(
        hasProfileChanges && hasPasswordChange
          ? 'Cập nhật thông tin và mật khẩu thành công.'
          : hasProfileChanges
            ? 'Cập nhật thông tin tài khoản thành công.'
            : 'Đổi mật khẩu thành công.'
      );
    } catch (err) {
      setErrorMessage(err.message || 'Không thể cập nhật thông tin tài khoản');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="account-info-container">
        <p>Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  return (
    <div className="account-info-container">
      <h2 className="page-title">Tài khoản của tôi</h2>
      {errorMessage && <p className="account-message error">{errorMessage}</p>}
      {successMessage && <p className="account-message success">{successMessage}</p>}
      <form className="account-info-form" onSubmit={handleSave}>
        <div className="info-section">
          {passwordMode ? (
            <div className="password-change-section">
              <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '600' }}>Đổi mật khẩu tài khoản</h3>
              
              <div className="form-row">
                <label className="form-label">Mật khẩu hiện tại:</label>
                <div className="form-value">
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="Nhập mật khẩu hiện tại"
                    required
                  />
                </div>
              </div>

              <div className="form-row" style={{ marginTop: '15px' }}>
                <label className="form-label">Mật khẩu mới:</label>
                <div className="form-value">
                  <input
                    type="password"
                    name="newPassword"
                    className="form-control"
                    value={form.newPassword}
                    onChange={handleChange}
                    disabled={saving}
                    placeholder="Nhập mật khẩu mới"
                    required
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="form-row avatar-row">
                <div className="form-value">
                  <div className="avatar-img">
                    {form.avatar_url
                      ? <img src={form.avatar_url} alt="Avatar" className="avatar-img__photo" />
                      : <AvatarIcon size={80} />
                    }
                  </div>
                  {editMode && (
                    <ImageUploadField 
                      label=""
                      value={form.avatar_url}
                      onChange={(url) => setForm({ ...form, avatar_url: url })}
                      folder="lcd/admin-avatar"
                      placeholder="Link ảnh đại diện..."
                      disabled={saving}
                    />
                  )}
                </div>
              </div>

              <div className="form-row">
                <label className="form-label">Họ tên:</label>
                <div className="form-value">
                  <span>{activeProfile?.full_name || ''}</span>
                </div>
              </div>

              {activeProfile?.member_type === 'student' && (
                <>
                  <div className="form-row">
                    <label className="form-label">Mã sinh viên:</label>
                    <div className="form-value">
                      <span>{activeProfile?.student_code || ''}</span>
                    </div>
                  </div>
                  <div className="form-row">
                    <label className="form-label">Lớp:</label>
                    <div className="form-value">
                      <span>{activeProfile?.class_name || ''}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="form-row">
                <label className="form-label">Gmail:</label>
                <div className="form-value">
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={form.email}
                      onChange={handleChange}
                      disabled={saving}
                      required
                    />
                  ) : (
                    <span>{activeProfile?.email || ''}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <label className="form-label">Quyền hạn:</label>
                <div className="form-value">
                  <span style={{ color: 'var(--color-primary)', fontWeight: '500' }}>
                    {(() => {
                      const role = activeProfile?.role;
                      if (role === 'admin_full') return 'Quản trị viên toàn quyền';
                      if (role === 'utility_only') return 'Quản trị viên tiện ích';
                      if (role === 'contact_manager') return 'Quản lý liên hệ';
                      if (role === 'post_author') return 'Người viết bài';
                      return role || 'N/A';
                    })()}
                  </span>
                </div>
              </div>

              {!editMode && (
                <div className="team-info-section" style={{ marginTop: '15px' }}>
                  <p className="team-info-label" style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Các ban tham gia:</p>
                  {activeProfile?.teams && activeProfile.teams.length > 0 ? (
                    <div className="team-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {activeProfile.teams.map((t, idx) => (
                        <div key={idx} className="team-item" style={{ background: 'var(--color-gray-50)', padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--color-gray-200)' }}>
                          <span className="team-name" style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{t.team_name}</span>
                          <span className="team-position" style={{ marginLeft: '10px', color: 'var(--color-primary)' }}>({t.team_position})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="no-team" style={{ color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>Chưa tham gia ban nào</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="action-section">
          {editMode || passwordMode ? (
            <>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>Hủy</button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-primary" onClick={handleEdit}>Chỉnh sửa thông tin</button>
              <button type="button" className="btn-primary" onClick={handlePasswordMode}>Đổi mật khẩu</button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}


