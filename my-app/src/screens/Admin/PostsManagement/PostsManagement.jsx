import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import './PostsManagement.css';
import { SearchBar, ImageUploadField } from '../../../components';
import { postsAPI, categoriesAPI, usersAPI, aiAPI, uploadsAPI, postTemplatesAPI } from '../../../services/api';
import { canMutatePost, canPublishPost, getStoredAdminUser, isAdminFull } from '../../../utils/adminPermissions';
import {
    buildCreatePostForm,
    buildEditPostForm,
    buildPostSavePayload,
    deletePostWithGuard,
    ensureCanMutatePost,
    slugifyPostTitle,
} from '../postManagementHelpers';
import {
    PublishIcon,
    EditIcon,
    DeleteIcon,
    NewsIcon,
    TrophyIcon,
    CalendarIcon,
    TargetIcon,
    FolderIcon,
    CloseIcon,
    StarIcon,
    ArrowLeftIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ChevronRightIcon,
    CheckIcon,
} from '../../../SvgIcons';
import useAdminConfirm from '../useAdminConfirm';
import { sanitizeHtmlForPaste } from '../../../utils/htmlSanitizer';

const EMPTY_FORM = { title: '', slug: '', summary: '', content: '', thumbnail: '', category_id: '', author_id: '', is_featured: false, is_published: false };

const PAGE_TYPE_LABELS = {
    news: 'Tin tức',
    achievement: 'Thành tích',
    event_annual: 'Sự kiện thường niên',
    event_non_annual: 'Sự kiện không thường niên',
};

const CLOUDINARY_POST_FOLDER_BY_PAGE_TYPE = {
    news: 'lcd/news-post-images',
    achievement: 'lcd/achievement-images',
    event: 'lcd/event-post-images',
    event_annual: 'lcd/event-post-images',
    event_non_annual: 'lcd/event-post-images',
};

function getPageTypeLabel(pageType) {
    if (!pageType) return 'Khác';
    return PAGE_TYPE_LABELS[pageType] || pageType;
}

function getPageTypeIcon(pageType) {
    if (pageType === 'news') return NewsIcon;
    if (pageType === 'achievement') return TrophyIcon;
    if (pageType === 'event_annual') return CalendarIcon;
    if (pageType === 'event_non_annual' || pageType === 'event') return TargetIcon;
    return FolderIcon;
}

function resolvePostUploadFolder(pageType) {
    const normalizedPageType = String(pageType || '').trim();
    return CLOUDINARY_POST_FOLDER_BY_PAGE_TYPE[normalizedPageType] || CLOUDINARY_POST_FOLDER_BY_PAGE_TYPE.news;
}

function normalizeDocText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function isWholeParagraphStyled(paragraphEl, allowedTags) {
    if (!paragraphEl) return false;
    const html = String(paragraphEl.innerHTML || '').trim();
    if (!html) return false;

    const pattern = new RegExp(`^<(${allowedTags.join('|')})(\\s[^>]*)?>[\\s\\S]*<\\/\\1>$`, 'i');
    return pattern.test(html);
}

function extractStructuredDocContentFromHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html || ''}</div>`, 'text/html');
    const blockNodes = Array.from(doc.body.querySelectorAll('p,h1,h2,h3,h4,li'));

    const blocks = blockNodes
        .map((node, index) => ({
            index,
            node,
            text: normalizeDocText(node.textContent),
            html: node.outerHTML,
            isBoldBlock: node.tagName === 'H1' || isWholeParagraphStyled(node, ['strong', 'b']),
            isItalicBlock: isWholeParagraphStyled(node, ['em', 'i']),
        }))
        .filter((item) => !!item.text);

    if (!blocks.length) {
        return { title: '', subtitle: '', bodyHtml: '<p><br/></p>' };
    }

    let titleIndex = blocks.find((item) => item.isBoldBlock)?.index;
    if (titleIndex === undefined) {
        titleIndex = blocks[0].index;
    }

    let subtitleIndex = blocks.find((item) => item.index !== titleIndex && item.isItalicBlock)?.index;
    if (subtitleIndex === undefined) {
        const fallback = blocks.find((item) => item.index !== titleIndex);
        subtitleIndex = fallback ? fallback.index : undefined;
    }

    const title = blocks.find((item) => item.index === titleIndex)?.text || '';
    const subtitle = subtitleIndex === undefined
        ? ''
        : (blocks.find((item) => item.index === subtitleIndex)?.text || '');

    const bodyBlocks = blocks.filter((item) => item.index !== titleIndex && item.index !== subtitleIndex);
    const bodyHtml = bodyBlocks.length ? bodyBlocks.map((item) => item.html).join('') : '<p><br/></p>';

    return { title, subtitle, bodyHtml };
}

function extractPlainBodyLinesFromHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${html || ''}</div>`, 'text/html');
    const blockNodes = Array.from(doc.body.querySelectorAll('p,h1,h2,h3,h4,h5,h6,li'));

    const lines = [];

    blockNodes.forEach((node, nodeIndex) => {
        const segments = String(node.innerHTML || '').split(/<br\s*\/?\s*>/gi);

        if (segments.length === 0) {
            lines.push('');
            return;
        }

        segments.forEach((segment) => {
            const temp = parser.parseFromString(`<div>${segment}</div>`, 'text/html');
            const text = String(temp.body.textContent || '').replace(/\u00a0/g, ' ').trim();
            lines.push(text);
        });

        if (nodeIndex < blockNodes.length - 1) {
            // Preserve spacing between paragraph-like blocks.
            lines.push('');
        }
    });

    if (lines.length) {
        return lines;
    }

    const fallbackText = String(doc.body.textContent || '').replace(/\u00a0/g, ' ').trim();
    return fallbackText ? [fallbackText] : [];
}

function buildDocFilename(sourceTitle) {
    const fallback = 'bai-viet';
    const slug = slugifyPostTitle(sourceTitle || '') || fallback;
    return `${slug}.docx`;
}

const DOCX_SAMPLE_POST = {
    title: 'Bai viet mau nhập file docx',
    subtitle: 'Dong nay la subtitle va duoc viet nghieng',
    content: `
        <p>Day la doan mo dau cho noi dung bai viet.</p>
        <p>Ban co the them nhieu doan van ban o phan body.</p>
        <p>Noi dung body su dung chu thuong, khong can in dam hay in nghieng.</p>
    `,
};

export default function PostsManagement() {
    const { confirm, confirmModal } = useAdminConfirm();
    const location = useLocation();
    const navigate = useNavigate();
    const postsMode = useMemo(() => {
        return new URLSearchParams(location.search).get('tab') || 'list';
    }, [location.search]);
    const postsEditorMode = useMemo(() => {
        return new URLSearchParams(location.search).get('mode') || '';
    }, [location.search]);
    const initialPageType = useMemo(() => {
        const value = new URLSearchParams(location.search).get('page_type') || '';
        return value;
    }, [location.search]);
    const viewTab = useMemo(() => {
        return postsMode === 'list' ? 'list' : 'editor';
    }, [postsMode]);
    const currentUser = useMemo(() => getStoredAdminUser(), []);
    const canPublish = canPublishPost(currentUser);
    const [statusTab, setStatusTab] = useState('all');
    const [editingPost, setEditingPost] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [searchQuery, setSearchQuery] = useState('');
    const [apiFilters, setApiFilters] = useState({ category_id: '', year: '', page_type: initialPageType, is_featured: '' });
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [aiKeywords, setAiKeywords] = useState('');
    const [aiTopic, setAiTopic] = useState('');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [aiError, setAiError] = useState('');
    const [templates, setTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [templateLoading, setTemplateLoading] = useState(false);
    const [templateSaving, setTemplateSaving] = useState(false);
    const [showTemplateNameModal, setShowTemplateNameModal] = useState(false);
    const [templateNameDraft, setTemplateNameDraft] = useState('');
    const [templateDraftPayload, setTemplateDraftPayload] = useState(null);
    const [showCatDropdown, setShowCatDropdown] = useState(false);
    const [hoveredPageType, setHoveredPageType] = useState(null);
    const [docImporting, setDocImporting] = useState(false);
    const [docExportingId, setDocExportingId] = useState('');
    const autoAppliedTemplateCategoryRef = useRef('');
    const catDropdownRef = useRef(null);
    const editorRef = useRef(null);
    const imageInputRef = useRef(null);
    const docInputRef = useRef(null);

    useEffect(() => {
        categoriesAPI.getAll().then(data => setCategories(Array.isArray(data) ? data : [])).catch(() => { });
        if (isAdminFull(currentUser)) {
            usersAPI.getAll().then(data => setUsers(Array.isArray(data) ? data : [])).catch(() => { });
        }
    }, []);

    useEffect(() => {
        fetchPosts(apiFilters);
    }, [apiFilters]);

    useEffect(() => {
        setApiFilters((prev) => {
            if (prev.page_type === initialPageType) {
                return prev;
            }
            return { ...prev, page_type: initialPageType };
        });
    }, [initialPageType]);

    useEffect(() => {
        if (postsMode !== 'create' || postsEditorMode === 'edit') {
            return;
        }

        if (editingPost) {
            setEditingPost(null);
            setForm(buildCreatePostForm(EMPTY_FORM, { authorId: currentUser?.id || '' }));
            setAiKeywords('');
            setAiTopic('');
            setAiError('');
            setSelectedTemplateId('');
            setTemplates([]);
            autoAppliedTemplateCategoryRef.current = '';
        }
    }, [postsMode, postsEditorMode, editingPost, currentUser]);

    const hasActiveFilter = apiFilters.category_id || apiFilters.year || apiFilters.page_type || apiFilters.is_featured !== '';
    const resetFilters = () => setApiFilters({ category_id: '', year: '', page_type: '', is_featured: '' });
    const setApiFilter = (key, value) => setApiFilters(prev => ({ ...prev, [key]: value }));

    const availableYears = useMemo(() => {
        const years = [...new Set(posts.filter(p => p.created_at).map(p => new Date(p.created_at).getFullYear()))].sort((a, b) => b - a);
        return years;
    }, [posts]);

    useEffect(() => {
        function handleClickOutside(e) {
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
                setShowCatDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function fetchPosts(filters = {}) {
        setLoading(true);
        setError('');
        try {
            const params = { limit: 500, include_unpublished: true };
            if (filters.category_id) params.category_id = filters.category_id;
            if (filters.year) params.year = filters.year;
            if (filters.page_type) params.page_type = filters.page_type;
            if (filters.is_featured !== '' && filters.is_featured !== undefined) params.is_featured = filters.is_featured;
            const data = await postsAPI.getAll(params);
            setPosts(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Không thể tải danh sách bài viết: ' + err.message);
        } finally {
            setLoading(false);
        }
    }

    function openEdit(post) {
        if (!ensureCanMutatePost(currentUser, post, 'Bạn chỉ có thể chỉnh sửa bài viết của mình.')) {
            return;
        }

        setEditingPost(post);
        setForm(buildEditPostForm(EMPTY_FORM, post));
        setAiKeywords('');
        setAiTopic(post.title || '');
        setAiError('');
        setPostsTabInUrl('edit');
        setSelectedTemplateId('');
        setTemplates([]);
        autoAppliedTemplateCategoryRef.current = '';
    }

    function closeEditor() {
        setPostsTabInUrl('list');
        setEditingPost(null);
        setForm(EMPTY_FORM);
        setAiKeywords('');
        setAiTopic('');
        setAiError('');
        setShowCatDropdown(false);
        setSelectedTemplateId('');
        setTemplates([]);
        autoAppliedTemplateCategoryRef.current = '';
    }

    function setPostsTabInUrl(nextTab) {
        const params = new URLSearchParams(location.search);
        if (nextTab === 'create' || nextTab === 'edit') {
            params.set('tab', 'create');
            if (nextTab === 'edit') {
                params.set('mode', 'edit');
            } else {
                params.delete('mode');
            }
        } else {
            params.set('tab', 'list');
            params.delete('mode');
        }
        navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
    }

    async function applyTemplateToForm(template, { force = false } = {}) {
        if (!template) {
            return;
        }

        const hasUserContent = !!(form.title?.trim() || form.summary?.trim() || form.content?.trim());
        if (hasUserContent && !force) {
            const confirmed = await confirm({
                title: 'Xác nhận áp dụng template',
                message: 'Áp dụng template sẽ ghi đè tiêu đề, tóm tắt và nội dung hiện tại.',
                detail: 'Bạn có chắc chắn muốn tiếp tục?',
                variant: 'warning',
                confirmText: 'Áp dụng',
                confirmButtonClassName: 'btn-primary',
            });
            if (!confirmed) {
                return;
            }
        }

        const title = String(template.title_template || '').trim();
        const summary = template.summary_template || '';
        const content = template.content_template || '';

        setForm((prev) => ({
            ...prev,
            title,
            slug: slugifyPostTitle(title),
            summary,
            content,
        }));

        if (editorRef.current) {
            editorRef.current.innerHTML = content || '<p><br/></p>';
        }
    }

    async function loadTemplatesForCategory(categoryId, { autoApplyDefault = false } = {}) {
        if (!categoryId) {
            setTemplates([]);
            setSelectedTemplateId('');
            return;
        }

        setTemplateLoading(true);
        try {
            const data = await postTemplatesAPI.getAll({ category_id: categoryId });
            const nextTemplates = Array.isArray(data) ? data : [];
            setTemplates(nextTemplates);

            const defaultTemplate = nextTemplates.find((item) => !!item.is_default && String(item.category_id) === String(categoryId));
            const pickedTemplate = defaultTemplate || nextTemplates[0] || null;
            setSelectedTemplateId(pickedTemplate ? String(pickedTemplate.id) : '');

            if (autoApplyDefault && defaultTemplate) {
                await applyTemplateToForm(defaultTemplate, { force: true });
            }
        } catch {
            setTemplates([]);
            setSelectedTemplateId('');
        } finally {
            setTemplateLoading(false);
        }
    }

    useEffect(() => {
        if (viewTab !== 'editor' || editingPost || !form.category_id) {
            return;
        }

        const categoryKey = String(form.category_id);
        const shouldAutoApply = autoAppliedTemplateCategoryRef.current !== categoryKey;

        loadTemplatesForCategory(form.category_id, { autoApplyDefault: shouldAutoApply })
            .finally(() => {
                autoAppliedTemplateCategoryRef.current = categoryKey;
            });
    }, [viewTab, editingPost, form.category_id]);

    async function handleSaveTemplateFromCurrentForm() {
        if (!form.category_id) {
            alert('Vui lòng chọn danh mục trước khi lưu template.');
            return;
        }

        const latestContent = editorRef.current ? editorRef.current.innerHTML : (form.content || '');
        const latestTitle = form.title || '';
        const latestSummary = form.summary || '';

        setTemplateDraftPayload({
            category_id: form.category_id,
            title_template: latestTitle,
            summary_template: latestSummary,
            content_template: latestContent,
        });
        setTemplateNameDraft(latestTitle || 'Template mới');
        setShowTemplateNameModal(true);
    }

    function closeTemplateNameModal() {
        if (templateSaving) {
            return;
        }
        setShowTemplateNameModal(false);
        setTemplateNameDraft('');
        setTemplateDraftPayload(null);
    }

    async function confirmSaveTemplateFromModal() {
        if (!templateDraftPayload) {
            closeTemplateNameModal();
            return;
        }

        const templateName = templateNameDraft.trim();
        if (!templateName || !templateName.trim()) {
            alert('Vui lòng nhập tên template.');
            return;
        }

        setTemplateSaving(true);
        try {
            const createdTemplate = await postTemplatesAPI.create({
                ...templateDraftPayload,
                name: templateName,
            });

            await loadTemplatesForCategory(templateDraftPayload.category_id, { autoApplyDefault: false });
            if (createdTemplate?.id) {
                setSelectedTemplateId(String(createdTemplate.id));
                await applyTemplateToForm(createdTemplate, { force: true });
            }
            closeTemplateNameModal();
            alert('Đã lưu template thành công.');
        } catch (err) {
            alert('Lưu template thất bại: ' + (err.message || 'Lỗi không xác định'));
        } finally {
            setTemplateSaving(false);
        }
    }

    async function handleApplySelectedTemplate() {
        const template = templates.find((item) => String(item.id) === String(selectedTemplateId));
        if (!template) {
            return;
        }
        await applyTemplateToForm(template);
    }

    async function handleGenerateWithAI() {
        setAiError('');
        if (!aiKeywords.trim()) {
            setAiError('Vui lòng nhập từ khóa trước khi gen AI.');
            return;
        }

        setAiGenerating(true);
        try {
            const category = categories.find(c => String(c.id) === String(form.category_id));
            const generated = await aiAPI.generatePost({
                keywords: aiKeywords,
                topic: aiTopic || form.title,
                page_type: category?.page_type || apiFilters.page_type || 'news',
            });

            const generatedTitle = (generated.title || '').trim();
            const generatedSummary = (generated.summary || '').trim();
            const generatedContent = (generated.content || '').trim();

            setForm(prev => {
                const title = generatedTitle || prev.title;
                return {
                    ...prev,
                    title,
                    slug: slugifyPostTitle(title),
                    summary: generatedSummary || prev.summary,
                    content: generatedContent || prev.content,
                };
            });

            // Reflect generated content immediately in the contenteditable editor.
            if (generatedContent && editorRef.current) {
                editorRef.current.innerText = generatedContent;
            }
        } catch (err) {
            setAiError(err.message || 'Không thể gen nội dung AI');
        } finally {
            setAiGenerating(false);
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        if (editorRef.current) {
            form.content = editorRef.current.innerHTML;
        }

        const isContentEmpty = !form.content || form.content.trim() === '' || form.content.trim() === '<p><br></p>' || form.content.trim() === '<p><br/></p>';
        
        if (!form.title || !form.slug || !form.summary || isContentEmpty) { 
            alert('Tiêu đề, slug, tóm tắt và nội dung là bắt buộc'); 
            return; 
        }
        setSaving(true);
        try {
            const payload = buildPostSavePayload({ form, currentUser, editingPost });

            if (editingPost) {
                if (!ensureCanMutatePost(currentUser, editingPost, 'Bạn chỉ có thể chỉnh sửa bài viết của mình.')) {
                    return;
                }
                await postsAPI.update(editingPost.id, payload);
            } else {
                await postsAPI.create({ ...payload, is_published: false });
            }
            closeEditor();
            await fetchPosts(apiFilters);
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handlePublish(post) {
        if (!canPublish) {
            alert('Bạn không có quyền duyệt bài viết.');
            return;
        }
        const confirmed = await confirm({
            title: 'Xác nhận xuất bản',
            message: `Duyệt và xuất bản bài "${post.title}"?`,
            detail: 'Bài viết sẽ hiển thị công khai sau khi xuất bản.',
            variant: 'info',
            confirmText: 'Xuất bản',
            confirmButtonClassName: 'btn-primary',
        });
        if (!confirmed) return;
        try {
            await postsAPI.update(post.id, {
                title: post.title,
                slug: post.slug,
                summary: post.summary ?? null,
                content: post.content ?? null,
                thumbnail: post.thumbnail ?? null,
                category_id: post.category_id ?? null,
                author_id: post.author_id ?? null,
                is_featured: !!post.is_featured,
                is_published: true,
            });
            await fetchPosts(apiFilters);
        } catch (err) {
            alert('Duyệt thất bại: ' + err.message);
        }
    }

    async function handleDelete(id) {
        try {
            await deletePostWithGuard({
                id,
                list: posts,
                currentUser,
                deniedMessage: 'Bạn chỉ có thể xóa bài viết của mình.',
                confirmMessage: 'Bạn có chắc muốn xóa bài viết này?',
                confirmFn: confirm,
                onSuccess: (deletedId) => {
                    setPosts(prev => prev.filter(p => p.id !== deletedId));
                },
            });
        } catch (err) {
            alert('Xóa thất bại: ' + err.message);
        }
    }

    function handleFormChange(field, value) {
        setForm(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'title' && !editingPost) next.slug = slugifyPostTitle(value);
            return next;
        });
    }

    function syncContentFromEditor() {
        if (!editorRef.current) return;
        const html = editorRef.current.innerHTML;
        setForm(prev => ({ ...prev, content: html }));
    }

    function handleEditorPaste(e) {
        e.preventDefault();

        const html = e.clipboardData.getData('text/html');
        const text = e.clipboardData.getData('text/plain');

        let contentToInsert = '';

        if (html) {
            contentToInsert = sanitizeHtmlForPaste(html);
        } else if (text) {
            // Convert plain text newlines to <p> tags or <br>
            contentToInsert = text
                .split(/\r?\n/)
                .map(line => line.trim() ? `<p>${line}</p>` : '<p><br/></p>')
                .join('');
        }

        if (contentToInsert) {
            document.execCommand('insertHTML', false, contentToInsert);
            syncContentFromEditor();
        }
    }

    function applyEditorCommand(command, value = null) {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false, value);
        syncContentFromEditor();
    }

    function handleCreateLink() {
        const link = window.prompt('Nhập URL liên kết (https://...)');
        if (!link) return;
        applyEditorCommand('createLink', link);
    }

    function openImagePicker() {
        imageInputRef.current?.click();
    }

    function handleEditorImageInsert(event) {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;
        insertImageFiles(files);
        event.target.value = '';
    }

    function insertImageFiles(files) {
        if (!editorRef.current) return;
        editorRef.current.focus();

        files.forEach((file) => {
            if (!file.type.startsWith('image/')) return;

            const reader = new FileReader();
            reader.onload = () => {
                const imageUrl = reader.result;
                document.execCommand('insertHTML', false, `<p><img src="${imageUrl}" alt="image" style="max-width:100%;height:auto;border-radius:8px;" /></p><p><br/></p>`);
                syncContentFromEditor();
            };
            reader.readAsDataURL(file);
        });
    }

    function handleEditorDrop(event) {
        const droppedFiles = Array.from(event.dataTransfer?.files || []);
        const images = droppedFiles.filter(file => file.type.startsWith('image/'));
        if (!images.length) return;
        event.preventDefault();
        insertImageFiles(images);
    }

    function handleThumbnailChange(url) {
        handleFormChange('thumbnail', url);
    }

    function openDocImportPicker() {
        docInputRef.current?.click();
    }

    async function handleDocImport(event) {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
            return;
        }

        const isDocx = file.name.toLowerCase().endsWith('.docx')
            || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        if (!isDocx) {
            alert('Vui lòng chọn file .docx hợp lệ.');
            return;
        }

        setDocImporting(true);
        try {
            if (postsMode === 'list') {
                setEditingPost(null);
                setPostsTabInUrl('create');
            }
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const { title, subtitle, bodyHtml } = extractStructuredDocContentFromHtml(result.value || '');

            if (!title && !subtitle && normalizeDocText(bodyHtml.replace(/<[^>]*>/g, '')) === '') {
                alert('Không đọc được nội dung từ file DOCX. Vui lòng kiểm tra lại định dạng file.');
                return;
            }

            setForm((prev) => {
                const resolvedTitle = title || prev.title;
                return {
                    ...prev,
                    title: resolvedTitle,
                    slug: resolvedTitle ? slugifyPostTitle(resolvedTitle) : prev.slug,
                    summary: subtitle || prev.summary,
                    content: bodyHtml,
                };
            });

            if (editorRef.current) {
                editorRef.current.innerHTML = bodyHtml;
            }

            if (title) {
                setAiTopic(title);
            }

            alert('Nhập file docx thành công. Quy chuẩn nhận dạng: title in đậm, subtitle in nghiêng, body chữ thường.');
        } catch (err) {
            alert('nhập file docx thất bại: ' + (err.message || 'Lỗi không xác định'));
        } finally {
            setDocImporting(false);
        }
    }

    async function exportPostAsDocx({ title, subtitle, content, fileNameHint, exportKey }) {
        if (!normalizeDocText(title)) {
            alert('Không thể xuất file docx vì bài viết chưa có tiêu đề.');
            return;
        }

        setDocExportingId(exportKey || 'exporting');
        try {
            const bodyLines = extractPlainBodyLinesFromHtml(content);
            const children = [
                new Paragraph({
                    children: [new TextRun({ text: normalizeDocText(title), bold: true, size: 30 })],
                    spacing: { after: 240 },
                }),
            ];

            if (normalizeDocText(subtitle)) {
                children.push(
                    new Paragraph({
                        children: [new TextRun({ text: normalizeDocText(subtitle), italics: true, size: 24 })],
                        spacing: { after: 220 },
                    })
                );
            }

            if (!bodyLines.length) {
                children.push(new Paragraph({ children: [new TextRun({ text: '', bold: false, italics: false })] }));
            } else {
                bodyLines.forEach((line) => {
                    children.push(
                        new Paragraph({
                            children: [new TextRun({ text: line, bold: false, italics: false, size: 24 })],
                            spacing: { after: 140 },
                        })
                    );
                });
            }

            const doc = new Document({ sections: [{ children }] });
            const blob = await Packer.toBlob(doc);
            const downloadUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = buildDocFilename(fileNameHint || title);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            alert('Xuất file docx thất bại: ' + (err.message || 'Lỗi không xác định'));
        } finally {
            setDocExportingId('');
        }
    }

    function handleExportCurrentDocx() {
        const content = editorRef.current ? editorRef.current.innerHTML : form.content;
        exportPostAsDocx({
            title: form.title,
            subtitle: form.summary,
            content,
            fileNameHint: form.slug || form.title,
            exportKey: 'current-editor',
        });
    }

    function handleDownloadSampleDocx() {
        exportPostAsDocx({
            title: DOCX_SAMPLE_POST.title,
            subtitle: DOCX_SAMPLE_POST.subtitle,
            content: DOCX_SAMPLE_POST.content,
            fileNameHint: 'mau-import-docx',
            exportKey: 'sample-docx',
        });
    }

    useEffect(() => {
        if (!editorRef.current || viewTab !== 'editor') return;
        editorRef.current.innerHTML = form.content || '<p><br/></p>';
    }, [viewTab, editingPost]);

    const categoriesByPageType = categories.reduce((acc, cat) => {
        const pt = cat.page_type || 'news';
        if (!acc[pt]) acc[pt] = [];
        acc[pt].push(cat);
        return acc;
    }, {});
    const pageTypeOrder = Object.keys(categoriesByPageType).sort((a, b) => {
        const aKnown = Object.prototype.hasOwnProperty.call(PAGE_TYPE_LABELS, a);
        const bKnown = Object.prototype.hasOwnProperty.call(PAGE_TYPE_LABELS, b);
        if (aKnown && !bKnown) return -1;
        if (!aKnown && bKnown) return 1;
        return a.localeCompare(b);
    });
    const filterPageTypeOptions = Array.from(
        new Set([
            ...Object.keys(PAGE_TYPE_LABELS),
            ...categories.map(cat => cat.page_type).filter(Boolean),
        ])
    );
    const selectedCatName = categories.find(c => String(c.id) === String(form.category_id))?.name || '';

    const filteredPosts = posts.filter(post => {
        const matchesSearch = !searchQuery || (post.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusTab === 'all'
            || (statusTab === 'pending' && !post.is_published)
            || (statusTab === 'approved' && post.is_published);
        return matchesSearch && matchesStatus;
    });

    const pageTitle = viewTab === 'list'
        ? 'Danh sách bài viết'
        : (editingPost ? 'Chỉnh sửa bài viết' : 'Tạo bài viết');

    return (
        <div className="posts-management">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">{pageTitle}</h1>
                </div>
            </div>

            {error && <div style={{ background: 'var(--color-state-danger-soft)', color: 'var(--color-state-danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}

            {viewTab === 'list' ? (
                <>
                    <div className="tabs-container status-tabs-wrap">
                        <div className="tabs">
                            <button className={`tab ${statusTab === 'all' ? 'active' : ''}`} onClick={() => setStatusTab('all')}>
                                Tất cả ({posts.length})
                            </button>
                            <button className={`tab ${statusTab === 'pending' ? 'active' : ''}`} onClick={() => setStatusTab('pending')}>
                                Chờ duyệt ({posts.filter(p => !p.is_published).length})
                            </button>
                            <button className={`tab ${statusTab === 'approved' ? 'active' : ''}`} onClick={() => setStatusTab('approved')}>
                                Đã duyệt ({posts.filter(p => p.is_published).length})
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="filters-bar">
                        <SearchBar
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onClear={() => setSearchQuery('')}
                            placeholder="Tìm kiếm bài viết..."
                            variant="toolbar"
                        />
                        <select className="filter-select" value={apiFilters.year} onChange={e => setApiFilter('year', e.target.value)}>
                            <option value="">Tất cả năm</option>
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <select className="filter-select" value={apiFilters.page_type} onChange={e => setApiFilter('page_type', e.target.value)}>
                            <option value="">Tất cả loại</option>
                            {filterPageTypeOptions.map(pageType => (
                                <option key={pageType} value={pageType}>{getPageTypeLabel(pageType)}</option>
                            ))}
                        </select>
                        <select className="filter-select" value={apiFilters.category_id} onChange={e => setApiFilter('category_id', e.target.value)}>
                            <option value="">Tất cả danh mục</option>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                        <select className="filter-select" value={apiFilters.is_featured} onChange={e => setApiFilter('is_featured', e.target.value)}>
                            <option value="">Tất cả bài viết</option>
                            <option value="true">Nổi bật</option>
                            <option value="false">Bình thường</option>
                        </select>
                        {hasActiveFilter && (
                            <button className="filter-reset-btn" onClick={resetFilters}>
                                <span className="filter-reset-icon" aria-hidden="true"><CloseIcon /></span>
                                Xóa lọc
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn-primary"
                            onClick={() => setPostsTabInUrl('create')}
                            style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
                        >
                            Tạo bài viết
                        </button>
                    </div>

                    {/* Posts Table */}
                    <div className="posts-table-container">
                        {loading ? (
                            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-soft)' }}>Đang tải...</p>
                        ) : (
                            <table className="posts-table">
                                <thead>
                                    <tr>
                                        <th>Tiêu đề</th>
                                        <th>Danh mục</th>
                                        <th>Tác giả</th>
                                        <th>Trạng thái</th>
                                        <th>Lượt xem</th>
                                        <th>Ngày tạo</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPosts.length === 0 && (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--color-text-soft)', padding: '24px' }}>Không có bài viết nào</td></tr>
                                    )}
                                    {filteredPosts.map(post => (
                                        <tr key={post.id}>
                                            <td>
                                                <div className="post-title-cell">
                                                    {post.title}
                                                    {post.is_featured ? (
                                                        <span className="featured-badge">
                                                            <span className="featured-badge-icon" aria-hidden="true"><StarIcon /></span>
                                                            Nổi bật
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td><span className="category-tag">{post.category_name || ''}</span></td>
                                            <td className="author-cell">{post.author_name || ''}</td>
                                            <td>
                                                <span className={`status-badge ${post.is_published ? 'approved' : 'pending'}`}>
                                                    {post.is_published ? 'Đã duyệt' : 'Chờ duyệt'}
                                                </span>
                                            </td>
                                            <td className="views-cell">{post.view_count || 0}</td>
                                            <td className="date-cell">{post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : ''}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    {!post.is_published && canPublish && (
                                                        <button className="btn-action btn-publish btn-action--icon-only" title="Duyệt & Xuất bản" onClick={() => handlePublish(post)}>
                                                            <span className="btn-action-icon" aria-hidden="true"><PublishIcon /></span>
                                                        </button>
                                                    )}
                                                    {canMutatePost(currentUser, post) && (
                                                        <button className="btn-action btn-edit btn-action--icon-only" title="Chỉnh sửa" onClick={() => openEdit(post)}>
                                                            <span className="btn-action-icon" aria-hidden="true"><EditIcon /></span>
                                                        </button>
                                                    )}
                                                    {canMutatePost(currentUser, post) && (
                                                        <button className="btn-action btn-delete btn-action--icon-only" title="Xóa" onClick={() => handleDelete(post.id)}>
                                                            <span className="btn-action-icon" aria-hidden="true"><DeleteIcon /></span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>



                </>

            ) : (
                <div className="editor-screen">
                    <div className="editor-header editor-header--actions-only">
                        <div className="editor-header-actions">
                            <button type="button" className="btn-secondary" onClick={openDocImportPicker} disabled={docImporting}>
                                {docImporting ? 'Đang nhập file docx...' : 'Nhập file docx'}
                            </button>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleDownloadSampleDocx}
                                disabled={docExportingId === 'sample-docx'}
                            >
                                {docExportingId === 'sample-docx' ? 'Đang tạo mẫu...' : 'Tải file mẫu DOCX'}
                            </button>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleExportCurrentDocx}
                                disabled={docExportingId === 'current-editor'}
                            >
                                {docExportingId === 'current-editor' ? 'Đang xuất file docx...' : 'Xuất file docx'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={closeEditor}>
                                <span className="btn-icon" aria-hidden="true"><ArrowLeftIcon /></span>
                                Quay lại danh sách
                            </button>
                        </div>
                    </div>

                    <input
                        ref={docInputRef}
                        type="file"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        style={{ display: 'none' }}
                        onChange={handleDocImport}
                    />

                    <form className="create-form" onSubmit={handleSave}>
                        <div className="editor-meta-grid">
                            <div className="form-group">
                                <label className="form-label">Danh mục *</label>
                                <div className="cat-dropdown-wrapper" ref={catDropdownRef}>
                                    <button
                                        type="button"
                                        className={`cat-dropdown-trigger${showCatDropdown ? ' open' : ''}`}
                                        onClick={() => { setShowCatDropdown(v => !v); setHoveredPageType(null); }}
                                    >
                                        <span className={`cat-dropdown-value${!selectedCatName ? ' placeholder' : ''}`}>
                                            {selectedCatName || 'Chọn danh mục'}
                                        </span>
                                        <span className="cat-dropdown-arrow" aria-hidden="true">
                                            {showCatDropdown ? <ChevronUpIcon /> : <ChevronDownIcon />}
                                        </span>
                                    </button>
                                    {showCatDropdown && (
                                        <div className="cat-dropdown-menu">
                                            {pageTypeOrder.length === 0 && (
                                                <div style={{ padding: '12px 16px', color: 'var(--color-text-soft)', fontSize: '14px' }}>Chưa có danh mục</div>
                                            )}
                                            {pageTypeOrder.map(pt => (
                                                <div
                                                    key={pt}
                                                    className={`cat-page-type-row${hoveredPageType === pt ? ' active' : ''}`}
                                                    onMouseEnter={() => setHoveredPageType(pt)}
                                                >
                                                    <span className="cat-page-type-label">
                                                        <span className="cat-page-type-label-icon" aria-hidden="true">{React.createElement(getPageTypeIcon(pt))}</span>
                                                        {getPageTypeLabel(pt)}
                                                    </span>
                                                    <span className="cat-page-type-arrow" aria-hidden="true"><ChevronRightIcon /></span>
                                                    {hoveredPageType === pt && (
                                                        <div className="cat-page-type-submenu">
                                                            {categoriesByPageType[pt].map(cat => (
                                                                <div
                                                                    key={cat.id}
                                                                    className={`cat-submenu-item${String(form.category_id) === String(cat.id) ? ' selected' : ''}`}
                                                                    onClick={() => { handleFormChange('category_id', cat.id); setShowCatDropdown(false); setHoveredPageType(null); }}
                                                                >
                                                                    {cat.name}
                                                                    {String(form.category_id) === String(cat.id) && (
                                                                        <span className="cat-submenu-check" aria-hidden="true"><CheckIcon /></span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>



                            <div className="form-group">
                                <label className="form-label">Tác giả</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    value={
                                        editingPost 
                                            ? (editingPost.author_name || editingPost.author_id) 
                                            : (currentUser?.full_name || currentUser?.username || '')
                                    } 
                                    disabled 
                                />
                            </div>

                            <ImageUploadField 
                                label="URL ảnh bìa"
                                value={form.thumbnail}
                                onChange={handleThumbnailChange}
                                folder={(form.category_id && categories.find(c => String(c.id) === String(form.category_id))?.slug) || 'lcd/posts'}
                                placeholder="https://..."
                                disabled={saving}
                            />
                            {form.thumbnail && (
                                <div className="thumbnail-preview-wrap" style={{ marginTop: '10px' }}>
                                    <img src={form.thumbnail} alt="Xem trước ảnh bìa" style={{ maxWidth: '200px', borderRadius: '8px' }} />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Tiêu đề *</label>
                                <input type="text" className="form-control" value={form.title} onChange={e => handleFormChange('title', e.target.value)} placeholder="Nhập tiêu đề bài viết..." required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Slug *</label>
                                <input type="text" className="form-control" value={form.slug} onChange={e => handleFormChange('slug', e.target.value)} placeholder="slug-bai-viet" required />
                            </div>

                            <div className="form-group full-row">
                                <label className="form-label">Tóm tắt *</label>
                                <textarea 
                                    className="form-control" 
                                    rows="3" 
                                    value={form.summary} 
                                    onChange={e => handleFormChange('summary', e.target.value)} 
                                    placeholder="Tóm tắt nội dung..." 
                                    required 
                                />
                            </div>

                            <div className="form-group full-row checkbox-row">
                                <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={form.is_featured} onChange={e => handleFormChange('is_featured', e.target.checked)} />
                                    <span>Bài viết nổi bật</span>
                                </label>
                                {editingPost && canPublish && (
                                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={form.is_published} onChange={e => handleFormChange('is_published', e.target.checked)} />
                                        <span>Xuất bản ngay</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="ai-generator-box">
                            <h3 className="ai-generator-title">🤖 Gen AI nội dung</h3>
                            <div className="form-group">
                                <label className="form-label">Từ khóa (phân tách bằng dấu phẩy) *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={aiKeywords}
                                    onChange={e => setAiKeywords(e.target.value)}
                                    placeholder="ví dụ: chào tân sinh viên, hoạt động đoàn, khoa CNTT"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Chủ đề (tuỳ chọn)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={aiTopic}
                                    onChange={e => setAiTopic(e.target.value)}
                                    placeholder="ví dụ: Chào tân sinh viên K66"
                                />
                            </div>
                            {aiError && <p className="ai-error-text">{aiError}</p>}
                            <button
                                type="button"
                                className="btn-ai"
                                onClick={handleGenerateWithAI}
                                disabled={aiGenerating}
                            >
                                {aiGenerating ? 'Đang gen AI...' : 'Gen AI tiêu đề + tóm tắt + nội dung'}
                            </button>
                        </div>

                        <div className="wp-editor-shell">
                            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Nội dung bài viết *</label>
                            <div className="wp-editor-toolbar">
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('bold')}><b>B</b></button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('italic')}><i>I</i></button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('underline')}><u>U</u></button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('insertUnorderedList')}>• List</button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('insertOrderedList')}>1. List</button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('formatBlock', '<h2>')}>H2</button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('formatBlock', '<h3>')}>H3</button>
                                <button type="button" className="toolbar-btn" onClick={handleCreateLink}>Link</button>
                                <button type="button" className="toolbar-btn" onClick={() => applyEditorCommand('unlink')}>Unlink</button>
                                <button type="button" className="toolbar-btn" onClick={openImagePicker}>📷 Thêm ảnh</button>
                            </div>

                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleEditorImageInsert}
                            />

                            <div
                                ref={editorRef}
                                className="wp-editor-body"
                                contentEditable
                                suppressContentEditableWarning
                                onInput={syncContentFromEditor}
                                onPaste={handleEditorPaste}
                                onDrop={handleEditorDrop}
                                onDragOver={event => event.preventDefault()}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={closeEditor}>Hủy</button>
                            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : (editingPost ? 'Cập nhật' : 'Tạo bài viết')}</button>
                        </div>
                    </form>
                </div>
            )}

            {showTemplateNameModal && (
                <div className="template-modal-overlay" onClick={closeTemplateNameModal}>
                    <div className="template-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="template-modal-title">Đặt tên template</h3>
                        <input
                            type="text"
                            className="form-control"
                            value={templateNameDraft}
                            onChange={(e) => setTemplateNameDraft(e.target.value)}
                            placeholder="Nhập tên template..."
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    confirmSaveTemplateFromModal();
                                }
                                if (e.key === 'Escape') {
                                    e.preventDefault();
                                    closeTemplateNameModal();
                                }
                            }}
                        />
                        <div className="template-modal-actions">
                            <button type="button" className="btn-secondary" onClick={closeTemplateNameModal} disabled={templateSaving}>Hủy</button>
                            <button type="button" className="btn-primary" onClick={confirmSaveTemplateFromModal} disabled={templateSaving}>
                                {templateSaving ? 'Đang lưu...' : 'Lưu template'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmModal}
        </div>
    );
}

