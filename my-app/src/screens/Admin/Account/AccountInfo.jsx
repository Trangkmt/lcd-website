import React, { useEffect, useMemo, useState } from 'react';
import { authAPI, uploadsAPI } from '../../../services/api';
import { ADMIN_AUTH_KEY } from '../../../utils/adminPermissions';
import { AvatarIcon } from '../../../SvgIcons';
import './AccountInfo.css';

export default function AccountInfo({ user }) {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
    password: '',
    newPassword: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

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
      full_name: activeProfile?.full_name || '',
      email: activeProfile?.email || '',
      avatar_url: activeProfile?.avatar_url || '',
      password: '',
      newPassword: '',
    }));
    setAvatarPreview(activeProfile?.avatar_url || '');
    setAvatarFile(null);
  }, [activeProfile]);

  const readFileAsDataUrl = (file) => (
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Không thể đọc file ảnh'));
      reader.readAsDataURL(file);
    })
  );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files && files[0]) {
      setAvatarFile(files[0]);
      setAvatarPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleEdit = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setErrorMessage('');
    setSuccessMessage('');
    setForm({
      full_name: activeProfile?.full_name || '',
      email: activeProfile?.email || '',
      avatar_url: activeProfile?.avatar_url || '',
      password: '',
      newPassword: '',
    });
    setAvatarPreview(activeProfile?.avatar_url || '');
    setAvatarFile(null);
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
      avatarFile
      || originalEmail !== currentEmail
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

      if (avatarFile) {
        setUploadingAvatar(true);
        const fileData = await readFileAsDataUrl(avatarFile);
        const uploadResult = await uploadsAPI.uploadImage(fileData, 'lcd/admin-avatar');
        nextAvatarUrl = uploadResult?.secure_url || nextAvatarUrl;
      }

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
      setUploadingAvatar(false);
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
        <div className="avatar-section">
          <div className="avatar-img">
            {avatarPreview
              ? <img src={avatarPreview} alt="Avatar" className="avatar-img__photo" />
              : <AvatarIcon size={80} />
            }
          </div>
          {editMode && (
            <input type="file" name="avatar" accept="image/*" onChange={handleChange} disabled={saving} />
          )}
        </div>
        <div className="info-section">
          <label>
            Họ tên:
            <span>{activeProfile?.full_name || ''}</span>
          </label>

          {activeProfile?.member_type === 'student' && (
            <>
              <label>
                Mã sinh viên:
                <span>{activeProfile?.student_code || ''}</span>
              </label>
              <label>
                Lớp:
                <span>{activeProfile?.class_name || ''}</span>
              </label>
            </>
          )}

          <label>
            Gmail:
            {editMode ? (
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={saving}
                required
              />
            ) : (
              <span>{activeProfile?.email || ''}</span>
            )}
          </label>

          <div className="team-info-section" style={{ marginTop: '15px' }}>
            <p className="team-info-label" style={{ fontWeight: '600', marginBottom: '8px', color: '#666' }}>Các ban tham gia:</p>
            {activeProfile?.teams && activeProfile.teams.length > 0 ? (
              <div className="team-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeProfile.teams.map((t, idx) => (
                  <div key={idx} className="team-item" style={{ background: '#f8f9fa', padding: '10px 15px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <span className="team-name" style={{ fontWeight: 'bold', color: '#333' }}>{t.team_name}</span>
                    <span className="team-position" style={{ marginLeft: '10px', color: '#007bff' }}>({t.team_position})</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="no-team" style={{ color: '#999', fontStyle: 'italic' }}>Chưa tham gia ban nào</span>
            )}
          </div>

          {editMode && (
            <div className="password-change-section" style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #ddd' }}>
              <p style={{ fontWeight: '600', marginBottom: '10px', color: '#444' }}>Đổi mật khẩu (nếu cần):</p>
              <label>
                Mật khẩu hiện tại:
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </label>
              <label style={{ marginTop: '10px' }}>
                Mật khẩu mới:
                <input
                  type="password"
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  disabled={saving}
                  placeholder="Nhập mật khẩu mới"
                />
              </label>
            </div>
          )}
        </div>
        <div className="action-section">
          {editMode ? (
            <>
              <button type="submit" className="btn-primary" disabled={saving}>
                {uploadingAvatar ? 'Đang upload ảnh...' : saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>Hủy</button>
            </>
          ) : (
            <button type="button" className="btn-primary" onClick={handleEdit}>Chỉnh sửa</button>
          )}
        </div>
      </form>
    </div>
  );
}
