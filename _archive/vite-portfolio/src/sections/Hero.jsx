import Button from '../components/Button';

/**
 * Hero section - main landing area with name, role, and action buttons
 * Includes philosophy statement and key CTAs
 */
export default function Hero() {
    return (
        <section id="home" className="section-container min-h-screen flex items-center">
            <div className="w-full">
                {/* Name */}
                <h1 className="heading-xl mb-6">
                    Nithish Kannan M
                </h1>

                {/* Role */}
                <p className="text-xl md:text-2xl text-dark-text-secondary mb-6">
                    AI Engineering | Deep Learning & Systems
                </p>

                {/* Philosophy Statement */}
                <p className="text-lg text-dark-text-muted max-w-2xl mb-10">
                    I build AI systems by understanding how components connect—from gradient mechanics to production deployment.
                    First-principles learning, systems thinking, and decision-centric design guide every implementation.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <Button variant="primary" href="#projects">
                        View Projects
                    </Button>
                    <Button variant="secondary" href="https://github.com/NithishkannanM">
                        GitHub
                    </Button>
                    <Button variant="secondary" href="https://www.linkedin.com/in/nithish-kannan-m/">
                        LinkedIn
                    </Button>
                    <Button variant="secondary" href="/resume.pdf">
                        Download Resume
                    </Button>
                </div>
            </div>
        </section>
    );
}
