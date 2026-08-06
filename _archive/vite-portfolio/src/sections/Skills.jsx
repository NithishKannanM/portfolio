import SkillTag from '../components/SkillTag';

/**
 * Skills section - organized by category for clarity
 * Displays technical skills across ML/AI, systems engineering, and tools
 * Star ratings show proficiency level, proof statements demonstrate depth
 */
export default function Skills() {
    const skillCategories = [
        {
            category: 'Machine Learning & AI (Core)',
            description: 'Honest depth across ML fundamentals and modern architectures',
            skills: [
                { name: 'Exploratory Data Analysis', stars: 4, proof: 'Reasoned about distributions, outliers, leakage' },
                { name: 'Regression & Classification', stars: 4, proof: 'Built, tuned, evaluated multiple models' },
                { name: 'CNNs', stars: 4, proof: 'CIFAR-100, custom CNNs, augmentation' },
                { name: 'NLP', stars: 3, proof: 'Tokenization, embeddings, transformers (usage)' },
                { name: 'Transformers', stars: 3, proof: 'Fine-tuning & inference understanding' },
                { name: 'Diffusion Models', stars: 3, proof: 'Conceptual + experimental exposure' },
                { name: 'GANs', stars: 2, proof: 'Understanding + basic implementations' },
                { name: 'Reinforcement Learning', stars: 3, proof: 'Core concepts & small experiments' },
                { name: 'Time Series Forecasting', stars: 3, proof: 'Feature-based & classical models' },
            ],
        },
        {
            category: 'Systems & Engineering (MY EDGE)',
            description: 'What separates me from tutorial-followers',
            skills: [
                { name: 'Inference Optimization', stars: 4, proof: 'Thought about latency, batch size, memory' },
                { name: 'Model vs System Trade-offs', stars: 4, proof: 'Accuracy vs speed vs stability' },
                { name: 'Resource-Aware ML', stars: 4, proof: 'Models don\'t assume infinite memory' },
                { name: 'Failure Mode Thinking', stars: 3, proof: 'Knows how models break' },
                { name: 'Deployment (APIs)', stars: 3, proof: 'Flask-based serving' },
                { name: 'Experiment Tracking', stars: 3, proof: 'Structured experimentation mindset' },
            ],
        },
        {
            category: 'Tools & Frameworks',
            description: 'Production-ready toolkit',
            skills: [
                { name: 'Python', stars: 4 },
                { name: 'PyTorch', stars: 4 },
                { name: 'TensorFlow / Keras', stars: 3 },
                { name: 'Scikit-learn', stars: 4 },
                { name: 'NumPy / Pandas', stars: 4 },
                { name: 'Docker', stars: 3 },
                { name: 'Git', stars: 4 },
                { name: 'SQL', stars: 3 },
            ],
        },
    ];

    return (
        <section id="skills" className="section-container">
            <h2 className="heading-lg mb-12">Skills</h2>

            <div className="space-y-12">
                {skillCategories.map((category, idx) => (
                    <div key={idx}>
                        <h3 className="text-xl font-bold text-dark-text-primary mb-2">
                            {category.category}
                        </h3>
                        {category.description && (
                            <p className="text-sm text-dark-text-muted mb-4 italic">
                                {category.description}
                            </p>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {category.skills.map((skill, skillIdx) => (
                                <SkillTag
                                    key={skillIdx}
                                    skill={skill.name}
                                    stars={skill.stars}
                                    proof={skill.proof}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer note */}
            <div className="mt-12 p-4 border border-dark-border rounded-md bg-dark-bg-subtle">
                <p className="text-sm text-dark-text-muted italic">
                    <strong>Star ratings reflect honest self-assessment</strong> — not inflated for marketing.
                    Hover over any skill to see proof of proficiency.
                </p>
            </div>
        </section>
    );
}

