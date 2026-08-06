/**
 * ProjectCard component for displaying individual project information
 * Shows title, problem statement, core insight, tech stack, and GitHub link
 */
export default function ProjectCard({ title, problem, insight, engineeringFocus, techStack, githubUrl }) {
    return (
        <div className="border border-dark-border rounded-lg p-6 hover:border-dark-text-muted transition-colors duration-200 bg-dark-surface">
            {/* Project Title */}
            <h3 className="heading-sm mb-3">{title}</h3>

            {/* Problem Statement */}
            <div className="mb-4">
                <p className="text-sm font-medium text-dark-text-primary mb-1">Problem</p>
                <p className="text-dark-text-secondary text-sm leading-relaxed">{problem}</p>
            </div>

            {/* Core Insight */}
            {insight && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-dark-text-primary mb-1">Core Insight</p>
                    <p className="text-dark-text-secondary text-sm leading-relaxed">{insight}</p>
                </div>
            )}

            {/* Engineering Focus */}
            {engineeringFocus && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-dark-text-primary mb-1">Engineering Focus</p>
                    <p className="text-dark-text-secondary text-sm leading-relaxed">{engineeringFocus}</p>
                </div>
            )}

            {/* Tech Stack */}
            <div className="mb-4">
                <p className="text-sm font-medium text-dark-text-secondary mb-2">Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                    {techStack.map((tech, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 text-xs border border-dark-border rounded-md text-dark-text-secondary"
                        >
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* GitHub Link or Ongoing Status */}
            {githubUrl ? (
                <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-dark-text-primary hover:text-dark-text-secondary transition-colors"
                >
                    View on GitHub →
                </a>
            ) : (
                <span className="inline-flex items-center text-sm text-dark-text-muted italic">
                    Ongoing Project
                </span>
            )}
        </div>
    );
}
