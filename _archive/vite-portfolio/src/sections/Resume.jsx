import Button from '../components/Button';

/**
 * Resume section - simple download area
 * Provides access to PDF resume
 */
export default function Resume() {
    return (
        <section id="resume" className="section-container">
            <h2 className="heading-lg mb-8">Resume</h2>

            <div className="max-w-3xl">
                <p className="text-dark-text-secondary mb-6 leading-relaxed">
                    Download my resume for a comprehensive overview of my education, projects, and technical skills.
                </p>

                <Button variant="primary" href="/resume.pdf">
                    Download Resume (PDF)
                </Button>
            </div>
        </section>
    );
}
