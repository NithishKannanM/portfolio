/**
 * Reusable Button component with primary and secondary variants
 * Optimized for dark theme with subtle hover effects
 */
export default function Button({ children, variant = 'primary', href, onClick, className = '' }) {
    const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-sm font-medium transition-all duration-200 rounded-lg";

    const variants = {
        primary: "bg-dark-text-primary text-dark-bg hover:bg-dark-text-secondary",
        secondary: "border border-dark-border text-dark-text-primary hover:border-dark-text-muted hover:bg-dark-surface",
    };

    const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

    // If href is provided, render as a link
    if (href) {
        return (
            <a
                href={href}
                className={combinedClassName}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
                {children}
            </a>
        );
    }

    // Otherwise render as a button
    return (
        <button onClick={onClick} className={combinedClassName}>
            {children}
        </button>
    );
}
