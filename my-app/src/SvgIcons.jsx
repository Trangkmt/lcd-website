import React from 'react';

function IconBase({ children, className = '', size = 16, strokeWidth = 1.8 }) {
    return (
        <svg
            className={className}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {children}
        </svg>
    );
}

export function AvatarIcon(props) {
    return (
        <IconBase {...props}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20" />
        </IconBase>
    );
}

export function PlusIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M12 5V19" />
            <path d="M5 12H19" />
        </IconBase>
    );
}

export function EditIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M12 20H21" />
            <path d="M16.5 3.5C17.3284 2.67157 18.6716 2.67157 19.5 3.5C20.3284 4.32843 20.3284 5.67157 19.5 6.5L8 18L4 19L5 15L16.5 3.5Z" />
        </IconBase>
    );
}

export function DeleteIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M3 6H21" />
            <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" />
            <path d="M19 6L18 20C17.964 20.5523 17.5523 21 17 21H7C6.44772 21 6.03603 20.5523 6 20L5 6" />
            <path d="M10 11V17" />
            <path d="M14 11V17" />
        </IconBase>
    );
}

export function ViewIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M2 12C4.2 7.8 7.8 5.5 12 5.5C16.2 5.5 19.8 7.8 22 12C19.8 16.2 16.2 18.5 12 18.5C7.8 18.5 4.2 16.2 2 12Z" />
            <circle cx="12" cy="12" r="3" />
        </IconBase>
    );
}

export function DownloadIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M12 4V15" />
            <path d="M8 11L12 15L16 11" />
            <path d="M5 20H19" />
        </IconBase>
    );
}

export function PublishIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M20 7L9 18L4 13" />
        </IconBase>
    );
}

export function MailIcon(props) {
    return (
        <IconBase {...props}>
            <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
            <path d="M3 7L12 13L21 7" />
        </IconBase>
    );
}

export function ShowIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M2 12C4.2 7.8 7.8 5.5 12 5.5C16.2 5.5 19.8 7.8 22 12C19.8 16.2 16.2 18.5 12 18.5C7.8 18.5 4.2 16.2 2 12Z" />
            <circle cx="12" cy="12" r="3" />
        </IconBase>
    );
}

export function HideIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M3 3L21 21" />
            <path d="M10.58 10.58C10.21 10.95 10 11.46 10 12C10 13.1 10.9 14 12 14C12.54 14 13.05 13.79 13.42 13.42" />
            <path d="M9.88 5.8C10.56 5.61 11.27 5.5 12 5.5C16.2 5.5 19.8 7.8 22 12C21.37 13.2 20.59 14.23 19.7 15.1" />
            <path d="M6.22 6.22C4.56 7.29 3.14 8.91 2 12C4.2 16.2 7.8 18.5 12 18.5C13.62 18.5 15.16 18.16 16.56 17.52" />
        </IconBase>
    );
}

export function MenuIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M4 7H20" />
            <path d="M4 12H20" />
            <path d="M4 17H20" />
        </IconBase>
    );
}

export function CloseIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M6 6L18 18" />
            <path d="M18 6L6 18" />
        </IconBase>
    );
}

export function DashboardIcon(props) {
    return (
        <IconBase {...props}>
            <rect x="3" y="3" width="8" height="8" rx="1.5" />
            <rect x="13" y="3" width="8" height="5" rx="1.5" />
            <rect x="13" y="10" width="8" height="11" rx="1.5" />
            <rect x="3" y="13" width="8" height="8" rx="1.5" />
        </IconBase>
    );
}

export function PostIcon(props) {
    return (
        <IconBase {...props}>
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8H16" />
            <path d="M8 12H16" />
            <path d="M8 16H13" />
        </IconBase>
    );
}

export function UsersIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M16 21V19C16 17.3431 14.6569 16 13 16H6C4.34315 16 3 17.3431 3 19V21" />
            <circle cx="9.5" cy="10" r="3" />
            <path d="M21 21V19.5C21 18.1193 20.0592 16.9586 18.786 16.618" />
            <path d="M16.5 5.4C17.5738 5.8626 18.3333 6.93086 18.3333 8.16667C18.3333 9.40248 17.5738 10.4707 16.5 10.9333" />
        </IconBase>
    );
}

export function TimelineIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M4 6H20" />
            <path d="M4 12H20" />
            <path d="M4 18H20" />
            <circle cx="7" cy="6" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="17" cy="18" r="1" />
        </IconBase>
    );
}

export function ToolsIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M14.7 6.3L17.7 3.3C18.5 2.5 19.8 2.5 20.6 3.3C21.4 4.1 21.4 5.4 20.6 6.2L17.6 9.2" />
            <path d="M13.3 7.7L4 17V20H7L16.3 10.7" />
            <path d="M3 3L8 8" />
        </IconBase>
    );
}

export function HomeIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M3 10.5L12 3L21 10.5" />
            <path d="M5 9.5V20H19V9.5" />
            <path d="M10 20V14H14V20" />
        </IconBase>
    );
}

export function LogoutIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M10 17L15 12L10 7" />
            <path d="M15 12H4" />
            <path d="M20 20H12C11.4477 20 11 19.5523 11 19V5C11 4.44772 11.4477 4 12 4H20" />
        </IconBase>
    );
}

export function FolderIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M3 7C3 5.89543 3.89543 5 5 5H9L11 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V7Z" />
        </IconBase>
    );
}

export function NewsIcon(props) {
    return (
        <IconBase {...props}>
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M8 8H16" />
            <path d="M8 12H16" />
            <path d="M8 16H13" />
        </IconBase>
    );
}

export function TrophyIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M8 4H16V7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7V4Z" />
            <path d="M9 20H15" />
            <path d="M12 11V20" />
            <path d="M6 5H4C4 7.20914 5.79086 9 8 9" />
            <path d="M18 5H20C20 7.20914 18.2091 9 16 9" />
        </IconBase>
    );
}

export function CalendarIcon(props) {
    return (
        <IconBase {...props}>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M8 3V7" />
            <path d="M16 3V7" />
            <path d="M3 10H21" />
        </IconBase>
    );
}

export function TargetIcon(props) {
    return (
        <IconBase {...props}>
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="12" cy="12" r="1" />
        </IconBase>
    );
}

export function TagIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M20 10L10 20L4 14L14 4H20V10Z" />
            <circle cx="16" cy="8" r="1" />
        </IconBase>
    );
}

export function HourglassIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M6 3H18" />
            <path d="M6 21H18" />
            <path d="M8 3C8 7 16 7 16 11C16 15 8 15 8 21" />
            <path d="M16 3C16 7 8 7 8 11C8 15 16 15 16 21" />
        </IconBase>
    );
}

export function SearchIcon(props) {
    return (
        <IconBase {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20L16.65 16.65" />
        </IconBase>
    );
}

export function ChevronDownIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M6 9L12 15L18 9" />
        </IconBase>
    );
}

export function ChevronUpIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M6 15L12 9L18 15" />
        </IconBase>
    );
}

export function ChevronRightIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M9 6L15 12L9 18" />
        </IconBase>
    );
}

export function CheckIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M20 7L9 18L4 13" />
        </IconBase>
    );
}

export function StarIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M12 3L14.9 8.9L21.4 9.8L16.7 14.3L17.8 20.8L12 17.7L6.2 20.8L7.3 14.3L2.6 9.8L9.1 8.9L12 3Z" />
        </IconBase>
    );
}

export function ArrowLeftIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M19 12H5" />
            <path d="M11 18L5 12L11 6" />
        </IconBase>
    );
}

export function ChevronLeftIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M15 6L9 12L15 18" />
        </IconBase>
    );
}

export function ArrowRightIcon(props) {
    return (
        <IconBase {...props}>
            <path d="M5 12H19" />
            <path d="M13 6L19 12L13 18" />
        </IconBase>
    );
}

export function SettingsIcon(props) {
    return (
        <IconBase {...props}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15A1.65 1.65 0 0 0 19.7 16.8L19.8 16.9A2 2 0 1 1 17 19.7L16.9 19.6A1.65 1.65 0 0 0 15.1 19.3A1.65 1.65 0 0 0 14 20.8V21A2 2 0 1 1 10 21V20.8A1.65 1.65 0 0 0 8.9 19.3A1.65 1.65 0 0 0 7.1 19.6L7 19.7A2 2 0 1 1 4.2 16.9L4.3 16.8A1.65 1.65 0 0 0 4.6 15A1.65 1.65 0 0 0 3.1 14H3A2 2 0 1 1 3 10H3.1A1.65 1.65 0 0 0 4.6 9A1.65 1.65 0 0 0 4.3 7.2L4.2 7.1A2 2 0 1 1 7 4.3L7.1 4.4A1.65 1.65 0 0 0 8.9 4.7A1.65 1.65 0 0 0 10 3.2V3A2 2 0 1 1 14 3V3.2A1.65 1.65 0 0 0 15.1 4.7A1.65 1.65 0 0 0 16.9 4.4L17 4.3A2 2 0 1 1 19.8 7.1L19.7 7.2A1.65 1.65 0 0 0 19.4 9A1.65 1.65 0 0 0 20.9 10H21A2 2 0 1 1 21 14H20.9A1.65 1.65 0 0 0 19.4 15Z" />
        </IconBase>
    );
}