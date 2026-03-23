function extractJsonFromText(text) {
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        const fenceMatch = text.match(/```json\s*([\s\S]*?)\s*```/i);
        if (fenceMatch?.[1]) {
            try {
                return JSON.parse(fenceMatch[1]);
            } catch {
                return null;
            }
        }
        return null;
    }
}

// POST /api/ai/generate-post
exports.generatePost = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
        if (!apiKey) {
            return res.status(500).json({ error: 'Thiếu cấu hình GEMINI_API_KEY ở backend' });
        }

        const { keywords, topic, page_type } = req.body;
        const keywordList = Array.isArray(keywords)
            ? keywords.map(k => String(k).trim()).filter(Boolean)
            : String(keywords || '')
                .split(',')
                .map(k => k.trim())
                .filter(Boolean);

        if (keywordList.length === 0) {
            return res.status(400).json({ error: 'Vui lòng nhập ít nhất 1 từ khóa' });
        }

        const prompt = `Bạn là trợ lý viết nội dung cho website liên chi đoàn.\nTạo nội dung bài đăng tiếng Việt, mạch lạc, phù hợp sinh viên.\n\nYêu cầu:\n- Chủ đề: ${topic || 'Tự đề xuất theo từ khóa'}\n- Page type: ${page_type || 'news'}\n- Từ khóa bắt buộc: ${keywordList.join(', ')}\n\nTrả về đúng JSON object với schema:\n{\n  "title": "...",\n  "summary": "...",\n  "content": "..."\n}\n\nRàng buộc:\n- title: 8-14 từ\n- summary: 1 đoạn 30-60 từ\n- content: tối thiểu 3 đoạn, có tiêu đề phụ markdown (##), tự nhiên và không nhồi từ khóa.\nKhông trả thêm text ngoài JSON.`;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.8,
                    responseMimeType: 'application/json'
                }
            }),
        });

        if (!response.ok) {
            const errorPayload = await response.json().catch(() => ({}));
            const message = errorPayload?.error?.message || `Gemini API lỗi (${response.status})`;
            return res.status(502).json({ error: message });
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const parsed = extractJsonFromText(text);

        if (!parsed?.title || !parsed?.summary || !parsed?.content) {
            return res.status(502).json({ error: 'AI trả về dữ liệu không hợp lệ, vui lòng thử lại.' });
        }

        res.json({
            title: String(parsed.title).trim(),
            summary: String(parsed.summary).trim(),
            content: String(parsed.content).trim(),
        });
    } catch (err) {
        console.error('AI generate post error:', err);
        res.status(500).json({ error: err.message || 'Lỗi tạo nội dung AI' });
    }
};
