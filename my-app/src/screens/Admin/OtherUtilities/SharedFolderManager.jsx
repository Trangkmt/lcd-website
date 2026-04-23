import React, { useEffect, useMemo, useRef, useState } from 'react';
import { sharedFoldersAPI } from '../../../services/api';
import { getStoredAdminUser } from '../../../utils/adminPermissions';
import { getAccessibleSharedFolders, getSharedFolderById } from '../../../utils/sharedFolders';
import { DeleteIcon, DownloadIcon, FolderIcon, PlusIcon } from '../../../SvgIcons';

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'txt'];

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Không thể đọc file.'));
        reader.readAsDataURL(file);
    });
}

function formatFileSize(bytes) {
    const size = Number(bytes || 0);
    if (!size) return '0 KB';

    const units = ['B', 'KB', 'MB', 'GB'];
    let currentSize = size;
    let unitIndex = 0;

    while (currentSize >= 1024 && unitIndex < units.length - 1) {
        currentSize /= 1024;
        unitIndex += 1;
    }

    return `${currentSize.toFixed(currentSize >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('vi-VN');
}

function isAllowedDocument(file) {
    const fileName = String(file?.name || '').toLowerCase();
    const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
    return ALLOWED_EXTENSIONS.includes(extension);
}

function buildDownloadName(file) {
    const name = String(file?.fileName || file?.originalFileName || 'tai-lieu').trim();
    if (file?.format && !name.toLowerCase().endsWith(`.${String(file.format).toLowerCase()}`)) {
        return `${name}.${file.format}`;
    }
    return name;
}

export default function SharedFolderManager() {
    const currentUser = useMemo(() => getStoredAdminUser(), []);
    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState('');
    const [folderFiles, setFolderFiles] = useState([]);
    const [loadingFolders, setLoadingFolders] = useState(true);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [savingFile, setSavingFile] = useState(false);
    const [actionMessage, setActionMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [pendingAction, setPendingAction] = useState(null);
    const fileInputRef = useRef(null);

    const accessibleFolders = useMemo(() => getAccessibleSharedFolders(currentUser), [currentUser]);
    const selectedFolder = useMemo(
        () => folders.find((folder) => folder.id === selectedFolderId) || null,
        [folders, selectedFolderId]
    );

    useEffect(() => {
        async function loadFolders() {
            setLoadingFolders(true);
            setErrorMessage('');

            try {
                const response = await sharedFoldersAPI.getFolders();
                const nextFolders = Array.isArray(response?.folders) ? response.folders : [];
                setFolders(nextFolders);
                setSelectedFolderId((current) => {
                    if (current && nextFolders.some((folder) => folder.id === current)) {
                        return current;
                    }
                    return nextFolders[0]?.id || '';
                });
            } catch (error) {
                setErrorMessage(error.message || 'Không thể tải danh sách folder.');
            } finally {
                setLoadingFolders(false);
            }
        }

        loadFolders();
    }, []);

    useEffect(() => {
        async function loadFiles() {
            if (!selectedFolderId) {
                setFolderFiles([]);
                return;
            }

            setLoadingFiles(true);
            setErrorMessage('');

            try {
                const response = await sharedFoldersAPI.getFolderFiles(selectedFolderId);
                setFolderFiles(Array.isArray(response?.files) ? response.files : []);
            } catch (error) {
                setErrorMessage(error.message || 'Không thể tải danh sách file.');
                setFolderFiles([]);
            } finally {
                setLoadingFiles(false);
            }
        }

        loadFiles();
    }, [selectedFolderId]);

    async function refreshSelectedFolder() {
        if (!selectedFolderId) return;
        setLoadingFiles(true);
        try {
            const response = await sharedFoldersAPI.getFolderFiles(selectedFolderId);
            setFolderFiles(Array.isArray(response?.files) ? response.files : []);
        } catch (error) {
            setErrorMessage(error.message || 'Không thể tải danh sách file.');
        } finally {
            setLoadingFiles(false);
        }
    }

    function openFilePicker(action) {
        setPendingAction({ ...action, folderId: selectedFolder?.id || '' });
        fileInputRef.current?.click();
    }

    async function handleFileChange(event) {
        const file = event.target.files?.[0];
        event.target.value = '';

        const targetFolderId = pendingAction?.folderId || selectedFolder?.id || '';
        const targetFolder = folders.find((folder) => folder.id === targetFolderId) || selectedFolder || null;

        if (!file || !targetFolder) {
            setPendingAction(null);
            return;
        }

        if (!isAllowedDocument(file)) {
            setErrorMessage('Vui lòng chọn file Excel, PDF, Word, PowerPoint, CSV hoặc TXT.');
            setPendingAction(null);
            return;
        }

        setSavingFile(true);
        setErrorMessage('');
        setActionMessage('');

        try {
            const fileData = await readFileAsDataUrl(file);
            await sharedFoldersAPI.uploadFile(targetFolder.id, {
                fileData,
                fileName: file.name,
            });
            setActionMessage(`Đã tải lên file ${file.name}.`);

            await refreshSelectedFolder();
        } catch (error) {
            setErrorMessage(error.message || 'Upload/cập nhật file thất bại.');
        } finally {
            setSavingFile(false);
            setPendingAction(null);
        }
    }

    async function handleDeleteFile(file) {
        if (!selectedFolder) return;

        const confirmDelete = window.confirm(`Xóa file "${buildDownloadName(file)}"?`);
        if (!confirmDelete) return;

        setSavingFile(true);
        setErrorMessage('');
        setActionMessage('');

        try {
            await sharedFoldersAPI.deleteFile(selectedFolder.id, file.publicId);
            setActionMessage(`Đã xoá file ${buildDownloadName(file)}.`);
            await refreshSelectedFolder();
        } catch (error) {
            setErrorMessage(error.message || 'Xóa file thất bại.');
        } finally {
            setSavingFile(false);
        }
    }

    async function handleDownloadFile(file) {
        if (!selectedFolder) return;

        try {
            const response = await sharedFoldersAPI.getDownloadInfo(selectedFolder.id, file.publicId);
            const downloadUrl = response?.downloadUrl;
            if (!downloadUrl) {
                throw new Error('Không lấy được link tải xuống.');
            }

            const fetchResponse = await fetch(downloadUrl);
            if (!fetchResponse.ok) {
                window.open(downloadUrl, '_blank', 'noopener,noreferrer');
                return;
            }

            const blob = await fetchResponse.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = buildDownloadName(file);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(objectUrl);
        } catch (error) {
            setErrorMessage(error.message || 'Tải file thất bại.');
        }
    }

    const hasFolders = folders.length > 0;
    const canManageSelectedFolder = !!selectedFolder?.canManage;
    const selectedFolderEntry = getSharedFolderById(selectedFolderId);

    return (
        <section className="shared-folder-manager">
            <div className="shared-folder-manager__header">
                <div>
                    <h2 className="page-title">Quản lý tài liệu theo ban</h2>
                    <p className="utility-hint">
                        {canManageSelectedFolder
                            ? 'Trưởng/phó ban có thể tải lên, cập nhật và xoá file trong ban của mình.'
                            : 'Bạn chỉ có quyền xem và tải xuống file trong ban được phân quyền.'}
                    </p>
                </div>
                <div className="shared-folder-manager__summary">
                    <span className="shared-folder-manager__summary-item">Ban khả dụng: {accessibleFolders.length}</span>
                    <span className="shared-folder-manager__summary-item">Thư mục đang mở: {selectedFolder?.name || 'Chưa có'}</span>
                </div>
            </div>

            {loadingFolders ? (
                <p className="info-text">Đang tải danh sách folder...</p>
            ) : !hasFolders ? (
                <div className="shared-folder-empty">
                    <p className="error-text">Chưa có folder nào phù hợp với tài khoản hiện tại.</p>
                </div>
            ) : (
                <div className="shared-folder-manager__layout">
                    <aside className="shared-folder-sidebar">
                        <div className="shared-folder-sidebar__title">Các ban được xem</div>
                        <div className="shared-folder-list">
                            {folders.map((folder) => {
                                const active = folder.id === selectedFolderId;
                                return (
                                    <button
                                        key={folder.id}
                                        type="button"
                                        className={`shared-folder-card ${active ? 'is-active' : ''}`}
                                        onClick={() => setSelectedFolderId(folder.id)}
                                    >
                                        <div className="shared-folder-card__header">
                                            <div className="shared-folder-card__icon" aria-hidden="true"><FolderIcon /></div>
                                            <div>
                                                <h3 className="shared-folder-card__name">{folder.name}</h3>
                                                <p className="shared-folder-card__code">{folder.code}</p>
                                            </div>
                                        </div>
                                        <p className="shared-folder-card__description">{folder.description}</p>
                                        <div className="shared-folder-card__footer">
                                            <span className={`shared-folder-badge ${folder.canManage ? 'is-manage' : 'is-view'}`}>
                                                {folder.canManage ? 'Có quyền quản lý' : 'Chỉ xem / tải'}
                                            </span>
                                            <span className="shared-folder-card__path">{folder.folderPath}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    <div className="shared-folder-main">
                        <div className="shared-folder-main__header">
                            <div>
                                <h3 className="shared-folder-main__title">{selectedFolder?.name || selectedFolderEntry?.name || 'Folder'}</h3>
                                <p className="shared-folder-main__subtitle">
                                    {selectedFolder?.description || selectedFolderEntry?.description || 'Chọn một folder để xem file.'}
                                </p>
                            </div>
                            <div className="shared-folder-main__actions">
                                {canManageSelectedFolder && (
                                    <>
                                        <button
                                            type="button"
                                            className="shared-folder-icon-btn shared-folder-icon-btn--primary"
                                            onClick={() => openFilePicker({ mode: 'create' })}
                                            disabled={savingFile}
                                            aria-label="Tải file mới"
                                            title={savingFile ? 'Đang xử lý...' : 'Tải file mới'}
                                        >
                                            <PlusIcon />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            key={selectedFolderId}
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt"
                                            className="shared-folder-hidden-input"
                                            onChange={handleFileChange}
                                        />
                                    </>
                                )}
                            </div>
                        </div>

                        {selectedFolder?.canManage && (
                            <p className="shared-folder-note">
                                Chọn file mới để thêm vào folder. Mỗi file cũ có thể xoá trước khi tải lên bản mới.
                            </p>
                        )}

                        {errorMessage && <p className="error-text">{errorMessage}</p>}
                        {actionMessage && <p className="success-text">{actionMessage}</p>}

                        {loadingFiles ? (
                            <p className="info-text">Đang tải danh sách file...</p>
                        ) : folderFiles.length === 0 ? (
                            <div className="shared-folder-empty">
                                <p className="info-text">Folder này chưa có file nào.</p>
                            </div>
                        ) : (
                            <div className="shared-folder-table-wrap">
                                <table className="shared-folder-table">
                                    <thead>
                                        <tr>
                                            <th>Tên file</th>
                                            <th>Loại</th>
                                            <th>Kích thước</th>
                                            <th>Cập nhật</th>
                                            <th>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {folderFiles.map((file) => (
                                            <tr key={file.publicId}>
                                                <td>
                                                    <div className="shared-folder-file-name">
                                                        <span className="shared-folder-file-name__main">{buildDownloadName(file)}</span>
                                                        <span className="shared-folder-file-name__sub">{file.publicId}</span>
                                                    </div>
                                                </td>
                                                <td>{String(file.format || '').toUpperCase() || '-'}</td>
                                                <td>{formatFileSize(file.size)}</td>
                                                <td>{formatDate(file.createdAt)}</td>
                                                <td>
                                                    <div className="shared-folder-action-row">
                                                        <button
                                                            type="button"
                                                            className="shared-folder-icon-btn"
                                                            onClick={() => handleDownloadFile(file)}
                                                            aria-label={`Tải xuống ${buildDownloadName(file)}`}
                                                            title="Tải xuống"
                                                        >
                                                            <DownloadIcon />
                                                        </button>
                                                        {selectedFolder?.canManage && (
                                                            <button
                                                                type="button"
                                                                className="shared-folder-icon-btn shared-folder-icon-btn--danger"
                                                                onClick={() => handleDeleteFile(file)}
                                                                disabled={savingFile}
                                                                aria-label={`Xoá ${buildDownloadName(file)}`}
                                                                title="Xoá"
                                                            >
                                                                <DeleteIcon />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}