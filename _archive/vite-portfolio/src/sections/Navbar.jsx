import { useState } from 'react';

/**
 * Navbar component - sticky navigation with section links
 * Includes mobile-responsive hamburger menu
 */
export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Home', href: '#home' },
        { name: 'Projects', href: '#projects' },
        { name: 'Blog', href: '#blog' },
        { name: 'Skills', href: '#skills' },
        { name: 'Resume', href: '#resume' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <nav className="sticky top-0 z-50 bg-dark-bg/95 backdrop-blur-sm border-b border-dark-border">
            <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo/Name */}
                    <a href="#home" className="text-xl font-semibold text-dark-text-primary hover:text-dark-text-secondary transition-colors">
                        Portfolio
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm text-dark-text-secondary hover:text-dark-text-primary transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-dark-text-primary"
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            {isMenuOpen ? (
                                <path d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 space-y-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className="block text-sm text-dark-text-secondary hover:text-dark-text-primary transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
