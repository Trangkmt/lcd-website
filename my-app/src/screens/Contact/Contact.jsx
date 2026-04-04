import React, { useMemo, useState } from 'react';
import './Contact.css';
import { contactAPI } from '../../services/api';

const initialForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
};

const Contact = () => {
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const isSubmitDisabled = useMemo(() => {
        return !form.name.trim() || !form.email.trim() || !form.message.trim() || submitting;
    }, [form, submitting]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            await contactAPI.create({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                subject: form.subject.trim(),
                message: form.message.trim()
            });

            setSuccessMessage('Câu hỏi của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.');
            setForm(initialForm);
        } catch (error) {
            setErrorMessage(error?.message || 'Không thể gửi câu hỏi. Vui lòng thử lại sau.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            <div className="contact-wrapper">
                <h1 className="contact-title">LIÊN HỆ</h1>
                <p className="contact-subtitle">Điền câu hỏi của bạn vào form bên dưới, đội ngũ Liên Chi Đoàn sẽ phản hồi trong thời gian sớm nhất.</p>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="contact-grid">
                        <div className="contact-field">
                            <label htmlFor="name">Họ và tên *</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Nhập họ và tên"
                                required
                            />
                        </div>

                        <div className="contact-field">
                            <label htmlFor="email">Email *</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Nhập email"
                                required
                            />
                        </div>

                        <div className="contact-field">
                            <label htmlFor="phone">Số điện thoại</label>
                            <input
                                id="phone"
                                name="phone"
                                type="text"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Nhập số điện thoại"
                            />
                        </div>

                        <div className="contact-field">
                            <label htmlFor="subject">Chủ đề</label>
                            <input
                                id="subject"
                                name="subject"
                                type="text"
                                value={form.subject}
                                onChange={handleChange}
                                placeholder="Ví dụ: Hỏi về hoạt động"
                            />
                        </div>
                    </div>

                    <div className="contact-field contact-field--full">
                        <label htmlFor="message">Câu hỏi *</label>
                        <textarea
                            id="message"
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            placeholder="Nhập nội dung câu hỏi của bạn"
                            rows={7}
                            required
                        />
                    </div>

                    {successMessage && <p className="contact-message contact-message--success">{successMessage}</p>}
                    {errorMessage && <p className="contact-message contact-message--error">{errorMessage}</p>}

                    <button className="contact-submit" type="submit" disabled={isSubmitDisabled}>
                        {submitting ? 'Đang gửi...' : 'Gửi câu hỏi'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Contact;
