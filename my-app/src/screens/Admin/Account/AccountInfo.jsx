import React, { useEffect, useMemo, useState } from 'react';
import { authAPI, uploadsAPI } from '../../../services/api';
import { ADMIN_AUTH_KEY } from '../../../utils/adminPermissions';
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

    setSaving(true);
    try {
      let nextAvatarUrl = form.avatar_url || '';

      if (avatarFile) {
        setUploadingAvatar(true);
        const fileData = await readFileAsDataUrl(avatarFile);
        const uploadResult = await uploadsAPI.uploadImage(fileData, 'lcd/admin-avatar');
        nextAvatarUrl = uploadResult?.secure_url || nextAvatarUrl;
      }

      const updatedProfile = await authAPI.updateMyProfile({
        full_name: form.full_name,
        email: form.email,
        avatar_url: nextAvatarUrl || null,
      });

      if (form.password && form.newPassword) {
        await authAPI.changePassword({
          password: form.password,
          newPassword: form.newPassword,
        });
      }

      setProfile(updatedProfile);
      localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(updatedProfile));
      setEditMode(false);
      setSuccessMessage('Cập nhật thông tin tài khoản thành công.');
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
            <h2>Tài khoản của tôi</h2>
      {errorMessage && <p className="account-message error">{errorMessage}</p>}
      {successMessage && <p className="account-message success">{successMessage}</p>}
            <form className="account-info-form" onSubmit={handleSave}>
                <div className="avatar-section">
                    <img
                        src={avatarPreview || '/default-avatar.png'}
                        alt="Avatar"
                        className="avatar-img"
                    />
                    {editMode && (
            <input type="file" name="avatar" accept="image/*" onChange={handleChange} disabled={saving} />
                    )}
                </div>
                <div className="info-section">
                    <label>
                        Họ tên:
                        {editMode ? (
                            <input
                                type="text"
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                disabled={saving}
                                required
                            />
                        ) : (
              <span>{activeProfile?.full_name || ''}</span>
                        )}
                    </label>
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
                    {editMode && (
                        <>
                            <label>
                                Mật khẩu hiện tại:
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                  disabled={saving}
                                />
                            </label>
                            <label>
                                Mật khẩu mới:
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={form.newPassword}
                                    onChange={handleChange}
                  disabled={saving}
                                />
                            </label>
                        </>
                    )}
                </div>
                <div className="action-section">
                    {editMode ? (
                        <>
              <button type="submit" disabled={saving}>
                {uploadingAvatar ? 'Đang upload ảnh...' : saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
              <button type="button" onClick={handleCancel} disabled={saving}>Hủy</button>
                        </>
                    ) : (
            <button type="button" onClick={handleEdit}>Chỉnh sửa</button>
                    )}
                </div>
            </form>
        </div>
    );
}
