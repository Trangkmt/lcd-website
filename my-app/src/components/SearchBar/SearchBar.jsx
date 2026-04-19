import React from 'react';
import { SearchIcon, CloseIcon } from '../../SvgIcons';
import './SearchBar.css';

export default function SearchBar({
    value,
    onChange,
    placeholder = 'Tìm kiếm...',
    onClear,
    clearAriaLabel = 'Xóa từ khóa tìm kiếm',
    variant = 'default',
    className = '',
    iconClassName = '',
    inputClassName = '',
    clearButtonClassName = '',
}) {
    const rootClassName = ['app-searchbar', 'app-searchbar--container', `app-searchbar--${variant}`, className]
        .filter(Boolean)
        .join(' ');
    const iconClasses = ['app-searchbar__icon', iconClassName].filter(Boolean).join(' ');
    const inputClasses = ['app-searchbar__input', inputClassName].filter(Boolean).join(' ');
    const clearClasses = ['app-searchbar__clear', clearButtonClassName].filter(Boolean).join(' ');

    return (
        <div className={rootClassName}>
            <span className={iconClasses} aria-hidden="true"><SearchIcon /></span>
            <input
                type="text"
                className={inputClasses}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
            {value && (
                <button
                    type="button"
                    className={clearClasses}
                    onClick={onClear}
                    aria-label={clearAriaLabel}
                >
                    <CloseIcon />
                </button>
            )}
        </div>
    );
}
