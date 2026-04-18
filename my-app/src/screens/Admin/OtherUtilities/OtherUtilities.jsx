import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import './OtherUtilities.css';

function sanitizeFileName(value) {
    return (value || 'khong-ten')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_ ]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

function extractNamesFromRows(rows) {
    const names = rows
        .map((row) => {
            if (!Array.isArray(row)) return '';
            const firstNonEmptyCell = row.find((cell) => String(cell ?? '').trim() !== '');
            return String(firstNonEmptyCell ?? '').trim();
        })
        .filter(Boolean);

    if (names.length === 0) return [];

    const first = names[0].toLowerCase();
    const isHeader = /^(name|full[_\s-]*name|h[oọ]\s*t[eê]n|ten)$/.test(first);
    return isHeader ? names.slice(1) : names;
}

const SUBTABS = {
    BULK_EXPORT: 'bulk-export',
    SHARED_DOCS: 'shared-docs',
};

const SHARED_DEPARTMENT_FOLDERS = [
    {
        id: 'bch',
        name: 'Ban Chấp Hành',
        code: 'BCH',
        description: 'Tài liệu điều hành, kế hoạch tổng và biên bản họp liên tịch.',
        documents: ['Quy chế BCH', 'Kế hoạch học kỳ', 'Biên bản họp tháng'],
    },
    {
        id: 'van-the',
        name: 'Ban Văn Thể',
        code: 'BVT',
        description: 'Kịch bản văn nghệ, lịch tập luyện và kế hoạch phong trào thể thao.',
        documents: ['Kế hoạch văn nghệ', 'Lịch tập luyện', 'Checklist hậu cần sân khấu'],
    },
    {
        id: 'tcsk',
        name: 'Ban Tổ Chức Sự Kiện',
        code: 'TCSK',
        description: 'Run sheet, phân công nhân sự và tài liệu vận hành sự kiện.',
        documents: ['Run sheet sự kiện', 'Sơ đồ nhân sự', 'Mẫu checklist setup'],
    },
    {
        id: 'ttkt',
        name: 'Ban Truyền Thông Kỹ Thuật',
        code: 'TTKT',
        description: 'Media kit, guideline thiết kế và tài nguyên truyền thông số.',
        documents: ['Brand guideline', 'Template poster', 'Danh sách asset truyền thông'],
    },
    {
        id: 'ctd-ptd',
        name: 'Ban Công Tác Đoàn và Phát Triển Đảng',
        code: 'CTD & PTD',
        description: 'Mẫu biểu đoàn vụ, hồ sơ đoàn viên và tài liệu phát triển đảng.',
        documents: ['Mẫu báo cáo đoàn vụ', 'Mẫu phiếu đoàn viên', 'Quy trình phát triển đảng'],
    },
    {
        id: 'doi-ngoai',
        name: 'Ban Đối Ngoại',
        code: 'ĐN',
        description: 'Hồ sơ đối tác, mẫu thư ngỏ và proposal tài trợ.',
        documents: ['Danh sách đối tác', 'Mẫu thư ngỏ', 'Proposal tài trợ'],
    },
];

export default function OtherUtilities() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeSubtab, setActiveSubtab] = useState(SUBTABS.BULK_EXPORT);
    const [canvaTemplateLink, setCanvaTemplateLink] = useState('');
    const [templateImageFile, setTemplateImageFile] = useState(null);
    const [templateImageUrl, setTemplateImageUrl] = useState('');
    const [templateSize, setTemplateSize] = useState({ width: 0, height: 0 });
    const [excelFile, setExcelFile] = useState(null);
    const [names, setNames] = useState([]);
    const [nameXPercent, setNameXPercent] = useState(50);
    const [nameYPercent, setNameYPercent] = useState(62);
    const [fontSize, setFontSize] = useState(48);
    const [fontColor, setFontColor] = useState('#1a1a1a');
    const [fontFamily, setFontFamily] = useState('Times New Roman');
    const [fontWeight, setFontWeight] = useState('700');
    const [parsingExcel, setParsingExcel] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isDraggingText, setIsDraggingText] = useState(false);
    const previewCanvasRef = useRef(null);

    const previewName = names[0] || 'Nguyễn Văn A';
    const hasData = useMemo(() => names.length > 0 && !!templateImageUrl, [names.length, templateImageUrl]);
    const pageTitle = activeSubtab === SUBTABS.SHARED_DOCS
        ? 'Tài liệu chung'
        : 'Xuất giấy mời/ chứng chỉ hàng loạt';

    const isValidCanvaLink = useMemo(
        () => /^https:\/\/(www\.)?canva\.com\//i.test(canvaTemplateLink.trim()),
        [canvaTemplateLink]
    );

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === SUBTABS.SHARED_DOCS) {
            setActiveSubtab(SUBTABS.SHARED_DOCS);
            return;
        }
        setActiveSubtab(SUBTABS.BULK_EXPORT);
    }, [searchParams]);

    function handleSubtabChange(nextTab) {
        setActiveSubtab(nextTab);
        setSearchParams({ tab: nextTab });
    }

    function openCanvaTemplate() {
        if (!isValidCanvaLink) {
            setErrorMessage('Link Canva không hợp lệ. Vui lòng dán link bắt đầu bằng https://www.canva.com/...');
            return;
        }
        window.open(canvaTemplateLink.trim(), '_blank', 'noopener,noreferrer');
    }

    function updateTextPositionFromClient(clientX, clientY) {
        const canvas = previewCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clampedX = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const clampedY = Math.max(0, Math.min(rect.height, clientY - rect.top));

        const nextXPercent = Number(((clampedX / rect.width) * 100).toFixed(2));
        const nextYPercent = Number(((clampedY / rect.height) * 100).toFixed(2));

        setNameXPercent(nextXPercent);
        setNameYPercent(nextYPercent);
    }

    function handleCanvasPointerDown(event) {
        if (!templateImageUrl) return;
        event.preventDefault();
        setIsDraggingText(true);
        updateTextPositionFromClient(event.clientX, event.clientY);
    }

    function drawTemplateWithName(canvas, image, name) {
        const context = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        let adjustedSize = fontSize;
        const maxWidth = canvas.width * 0.8;
        context.fillStyle = fontColor;
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        do {
            context.font = `${fontWeight} ${adjustedSize}px ${fontFamily}`;
            adjustedSize -= 1;
        } while (context.measureText(name).width > maxWidth && adjustedSize > 20);

        const x = (nameXPercent / 100) * canvas.width;
        const y = (nameYPercent / 100) * canvas.height;
        context.fillText(name, x, y);
    }

    async function handleTemplateImageChange(file) {
        setTemplateImageFile(file || null);
        setErrorMessage('');
        setSuccessMessage('');
        if (!file) {
            setTemplateImageUrl('');
            setTemplateSize({ width: 0, height: 0 });
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            setTemplateSize({ width: image.width, height: image.height });
            setTemplateImageUrl(objectUrl);
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            setErrorMessage('Không thể đọc ảnh template. Vui lòng dùng PNG/JPG export từ Canva.');
        };
        image.src = objectUrl;
    }

    useEffect(() => {
        if (!templateImageUrl || !previewCanvasRef.current) return;
        const image = new Image();
        image.onload = () => {
            drawTemplateWithName(previewCanvasRef.current, image, previewName);
        };
        image.src = templateImageUrl;
    }, [templateImageUrl, previewName, fontSize, fontColor, fontFamily, fontWeight, nameXPercent, nameYPercent]);

    useEffect(() => () => {
        if (templateImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(templateImageUrl);
        }
    }, [templateImageUrl]);

    useEffect(() => {
        if (!isDraggingText) return;

        function handleWindowPointerMove(event) {
            updateTextPositionFromClient(event.clientX, event.clientY);
        }

        function handleWindowPointerUp() {
            setIsDraggingText(false);
        }

        window.addEventListener('pointermove', handleWindowPointerMove);
        window.addEventListener('pointerup', handleWindowPointerUp);

        return () => {
            window.removeEventListener('pointermove', handleWindowPointerMove);
            window.removeEventListener('pointerup', handleWindowPointerUp);
        };
    }, [isDraggingText]);

    async function handleExcelChange(file) {
        setExcelFile(file || null);
        setNames([]);
        setErrorMessage('');
        setSuccessMessage('');

        if (!file) return;

        setParsingExcel(true);
        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            if (!firstSheetName) {
                throw new Error('Không tìm thấy sheet trong file Excel.');
            }

            const sheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
            const extractedNames = extractNamesFromRows(rows);

            if (extractedNames.length === 0) {
                throw new Error('Không đọc được danh sách tên từ file Excel.');
            }

            setNames(extractedNames);
            setSuccessMessage(`Đã đọc ${extractedNames.length} tên từ file Excel.`);
        } catch (error) {
            console.error(error);
            setErrorMessage(error.message || 'Không thể đọc file Excel.');
        } finally {
            setParsingExcel(false);
        }
    }

    function handleDownloadExcelTemplate() {
        const worksheet = XLSX.utils.aoa_to_sheet([
            ['ho_ten'],
            ['Nguyễn Văn A'],
            ['Trần Thị B'],
            ['Lê Văn C'],
        ]);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSach');
        XLSX.writeFile(workbook, 'mau-danh-sach-giay-moi.xlsx');
    }

    async function handleExportInvitations() {
        setErrorMessage('');
        setSuccessMessage('');

        if (names.length === 0) {
            setErrorMessage('Vui lòng chọn file Excel chứa danh sách tên.');
            return;
        }

        if (!templateImageUrl) {
            setErrorMessage('Vui lòng tải ảnh template đã export từ Canva.');
            return;
        }

        setGenerating(true);
        try {
            const zip = new JSZip();
            const image = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('Không thể tải ảnh template.'));
                img.src = templateImageUrl;
            });

            for (const name of names) {
                const canvas = document.createElement('canvas');
                drawTemplateWithName(canvas, image, name);
                const dataUrl = canvas.toDataURL('image/png');
                const base64Data = dataUrl.split(',')[1];
                const filename = `giay-moi-${sanitizeFileName(name)}.png`;
                zip.file(filename, base64Data, { base64: true });
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const downloadUrl = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            const day = new Date().toISOString().slice(0, 10);

            link.href = downloadUrl;
            link.download = `giay-moi-${day}.zip`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(downloadUrl);

            setSuccessMessage(`Xuất thành công ${names.length} giấy mời PNG từ template Canva.`);
        } catch (error) {
            console.error(error);
            setErrorMessage('Xuất giấy mời thất bại. Vui lòng kiểm tra ảnh template và dữ liệu tên.');
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div className="other-utilities">
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">{pageTitle}</h1>
                </div>
            </div>

            <div className="utilities-subtabs" role="tablist" aria-label="Tiện ích khác">
                <button
                    type="button"
                    className={`utilities-subtab ${activeSubtab === SUBTABS.BULK_EXPORT ? 'active' : ''}`}
                    onClick={() => handleSubtabChange(SUBTABS.BULK_EXPORT)}
                >
                    Xuất giấy mời/ chứng chỉ hàng loạt
                </button>
                <button
                    type="button"
                    className={`utilities-subtab ${activeSubtab === SUBTABS.SHARED_DOCS ? 'active' : ''}`}
                    onClick={() => handleSubtabChange(SUBTABS.SHARED_DOCS)}
                >
                    Tài liệu chung
                </button>
            </div>

            {activeSubtab === SUBTABS.BULK_EXPORT && (
                <div className="utility-card">
                    <h2 className="utility-title">Xuất giấy mời/ chứng chỉ hàng loạt</h2>

                    <div className="utility-hint">
                        Dùng template bạn đã thiết kế trên Canva: export PNG/JPG, tải lên đây rồi thay tên hàng loạt từ Excel.
                    </div>

                    <div className="canva-link-box">
                        <div className="canva-link-title">Template Canva</div>
                        <p className="canva-link-hint">
                            Dán link template Canva để mở nhanh. Sau đó export ảnh từ Canva và tải ảnh vào bên dưới để render + thay tên.
                        </p>
                        <div className="canva-link-row">
                            <input
                                type="url"
                                className="form-control"
                                placeholder="https://www.canva.com/design/..."
                                value={canvaTemplateLink}
                                onChange={(e) => setCanvaTemplateLink(e.target.value)}
                            />
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={openCanvaTemplate}
                                disabled={!canvaTemplateLink.trim()}
                            >
                                Mở link Canva
                            </button>
                        </div>
                        <p className="canva-link-note">
                            Cách lấy link: Canva, vào Share/Chia sẻ, sau đó Copy link.
                        </p>
                    </div>

                    <div className="templates-grid">
                        <div className="form-group">
                            <label className="form-label">Ảnh template export từ Canva (PNG/JPG)</label>
                            <input
                                type="file"
                                accept=".png,.jpg,.jpeg,.webp"
                                className="form-control"
                                onChange={(e) => handleTemplateImageChange(e.target.files?.[0] || null)}
                            />
                            {templateImageFile && <p className="file-name">Đã chọn: {templateImageFile.name}</p>}
                            {templateSize.width > 0 && (
                                <p className="file-name">Kích thước: {templateSize.width} x {templateSize.height}px</p>
                            )}
                        </div>
                    </div>

                    <div className="template-preview">
                        <div className="template-preview-title">Xem trước render tên</div>
                        <p className="drag-hint">Kéo thả trực tiếp trên ảnh để di chuyển vị trí tên.</p>
                        <div className="overlay-controls">
                            <label>
                                X (%):
                                <input type="number" min="0" max="100" value={nameXPercent} onChange={(e) => setNameXPercent(Number(e.target.value) || 0)} />
                            </label>
                            <label>
                                Y (%):
                                <input type="number" min="0" max="100" value={nameYPercent} onChange={(e) => setNameYPercent(Number(e.target.value) || 0)} />
                            </label>
                            <label>
                                Cỡ chữ:
                                <input type="number" min="12" max="120" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value) || 12)} />
                            </label>
                            <label>
                                Màu:
                                <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} />
                            </label>
                            <label>
                                Font:
                                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Arial">Arial</option>
                                    <option value="Roboto">Roboto</option>
                                    <option value="Tahoma">Tahoma</option>
                                </select>
                            </label>
                            <label>
                                Đậm:
                                <select value={fontWeight} onChange={(e) => setFontWeight(e.target.value)}>
                                    <option value="400">Thường</option>
                                    <option value="700">Đậm</option>
                                </select>
                            </label>
                        </div>
                        <div className="template-preview-box canvas-wrap">
                            {templateImageUrl ? (
                                <canvas
                                    ref={previewCanvasRef}
                                    className={`template-canvas ${isDraggingText ? 'dragging' : 'draggable'}`}
                                    onPointerDown={handleCanvasPointerDown}
                                />
                            ) : (
                                <p>Tải ảnh template Canva để xem trước vị trí tên.</p>
                            )}
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">Danh sách tên (Excel)</label>
                            <div className="excel-template-row">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleDownloadExcelTemplate}
                                >
                                    Tải mẫu Excel
                                </button>
                                <span className="excel-template-note">Dùng cột đầu tiên là họ tên (ví dụ: ho_ten)</span>
                            </div>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                className="form-control"
                                onChange={(e) => handleExcelChange(e.target.files?.[0] || null)}
                            />
                            {excelFile && <p className="file-name">Đã chọn: {excelFile.name}</p>}
                        </div>
                    </div>

                    {parsingExcel && <p className="info-text">Đang đọc file Excel...</p>}
                    {errorMessage && <p className="error-text">{errorMessage}</p>}
                    {successMessage && <p className="success-text">{successMessage}</p>}

                    {names.length > 0 && (
                        <div className="preview-box">
                            <div className="preview-title">Xem trước ({names.length} tên)</div>
                            <div className="preview-list">
                                {names.slice(0, 10).map((name, index) => (
                                    <span key={`${name}-${index}`} className="name-chip">{name}</span>
                                ))}
                                {names.length > 10 && <span className="name-chip more">+{names.length - 10} tên khác</span>}
                            </div>
                        </div>
                    )}

                    <button
                        className="btn-primary"
                        onClick={handleExportInvitations}
                        disabled={!hasData || generating || parsingExcel}
                    >
                        {generating ? 'Đang xuất...' : 'Xuất giấy mời/chứng chỉ (.zip)'}
                    </button>
                </div>
            )}

            {activeSubtab === SUBTABS.SHARED_DOCS && (
                <div className="utility-card">
                    <h2 className="utility-title">Tài liệu chung</h2>
                    <p className="utility-hint">Giao diện thư mục theo từng ban để tập trung quản lý tài liệu nội bộ.</p>

                    <div className="folders-grid">
                        {SHARED_DEPARTMENT_FOLDERS.map((folder) => (
                            <article key={folder.id} className="folder-card">
                                <div className="folder-card__header">
                                    <div className="folder-icon" aria-hidden="true">📁</div>
                                    <div>
                                        <h3 className="folder-name">{folder.name}</h3>
                                        <p className="folder-code">{folder.code}</p>
                                    </div>
                                </div>

                                <p className="folder-description">{folder.description}</p>

                                <div className="folder-documents">
                                    {folder.documents.map((doc) => (
                                        <span key={doc} className="folder-doc-chip">{doc}</span>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
