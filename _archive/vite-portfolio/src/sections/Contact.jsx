import { useState } from 'react';
import emailjs from '@emailjs/browser';

/**
 * Contact section - functional contact form with email integration
 * Uses EmailJS for sending emails directly from the client
 */
export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState(''); // 'sending', 'success', 'error'

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');

        try {
            // EmailJS configuration
            // You'll need to replace these with your actual EmailJS credentials
            const serviceId = 'service_obyr447';
            const templateId = 'template_h08jyrk';
            const publicKey = 'inEv23ZpZNS0IeJBn';

            const templateParams = {
                from_name: formData.name,
                from_email: formData.email,
                message: formData.message,
                to_name: 'Nithish Kannan M'
            };

            await emailjs.send(
                serviceId,
                templateId,
                templateParams,
                publicKey
            );

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });

            // Reset success message after 5 seconds
            setTimeout(() => setStatus(''), 5000);
        } catch (error) {
            console.error('Failed to send email:', error);
            setStatus('error');

            // Reset error message after 5 seconds
            setTimeout(() => setStatus(''), 5000);
        }
    };

    return (
        <section id="contact" className="section-container">
            <h2 className="heading-lg mb-12">Get in Touch</h2>

            {/* Two Column Layout: Links Left, Form Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                {/* Left Side - Contact Information */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold text-dark-text-primary mb-4">
                            Let's Connect
                        </h3>
                        <p className="text-dark-text-secondary leading-relaxed">
                            Feel free to reach out for opportunities, collaborations, or technical discussions.
                            I'm always open to interesting conversations about AI, ML, and systems engineering.
                        </p>
                    </div>

                    {/* Contact Links */}
                    <div className="space-y-6">
                        {/* Email */}
                        <div>
                            <p className="text-xs text-dark-text-muted mb-2 uppercase tracking-wider">Email</p>
                            <a
                                href="mailto:nithishkannanm1@gmail.com"
                                className="text-lg text-dark-text-primary hover:text-dark-text-secondary transition-colors flex items-center gap-2"
                            >
                                {/* <span>📧</span> */}
                                <span>nithishkannanm1@gmail.com</span>
                            </a>
                        </div>

                        {/* GitHub */}
                        <div>
                            <p className="text-xs text-dark-text-muted mb-2 uppercase tracking-wider">GitHub</p>
                            <a
                                href="https://github.com/NithishkannanM"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-lg text-dark-text-primary hover:text-dark-text-secondary transition-colors flex items-center gap-2"
                            >
                                {/* <span>🔗</span> */}
                                <span>github.com/NithishkannanM</span>
                            </a>
                        </div>

                        {/* LinkedIn */}
                        <div>
                            <p className="text-xs text-dark-text-muted mb-2 uppercase tracking-wider">LinkedIn</p>
                            <a
                                href="https://www.linkedin.com/in/nithish-kannan-m/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-lg text-dark-text-primary hover:text-dark-text-secondary transition-colors flex items-center gap-2"
                            >
                                {/* <span>💼</span> */}
                                <span>linkedin.com/in/nithish-kannan-m</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right Side - Compact Contact Form */}
                <div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-dark-text-primary mb-2"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-white border border-dark-border rounded-md text-black placeholder-gray-400 focus:outline-none focus:border-dark-text-muted transition-colors"
                                placeholder="Your name"
                            />
                        </div>

                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-dark-text-primary mb-2"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-white border border-dark-border rounded-md text-black placeholder-gray-400 focus:outline-none focus:border-dark-text-muted transition-colors"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        {/* Message Field */}
                        <div>
                            <label
                                htmlFor="message"
                                className="block text-sm font-medium text-dark-text-primary mb-2"
                            >
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows="5"
                                className="w-full px-4 py-2.5 bg-white border border-dark-border rounded-md text-black placeholder-gray-400 focus:outline-none focus:border-dark-text-muted transition-colors resize-none"
                                placeholder="Your message..."
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            className="w-full px-6 py-2.5 bg-dark-bg-primary border border-dark-border rounded-md text-dark-text-primary font-medium hover:border-dark-text-muted hover:text-dark-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {status === 'sending' ? 'Sending...' : 'Send Message'}
                        </button>

                        {/* Status Messages */}
                        {status === 'success' && (
                            <div className="p-3 bg-green-900/20 border border-green-700 rounded-md">
                                <p className="text-sm text-green-400">
                                    ✓ Message sent successfully! I'll get back to you soon.
                                </p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="p-3 bg-red-900/20 border border-red-700 rounded-md">
                                <p className="text-sm text-red-400">
                                    ✗ Failed to send message. Please email me directly.
                                </p>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-dark-border">
                <p className="text-sm text-dark-text-muted text-center">
                    © {new Date().getFullYear()} Nithish Kannan M. Built with React and Tailwind CSS.
                </p>
            </div>
        </section>
    );
}
