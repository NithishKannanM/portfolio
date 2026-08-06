/**
 * Learning Philosophy section - differentiator from tutorial-based learners
 * Explains structured approach to understanding deep learning
 */
export default function LearningPhilosophy() {
    return (
        <section id="philosophy" className="section-container">
            <h2 className="heading-lg mb-8">Learning Philosophy</h2>

            <div className="max-w-3xl space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-dark-text-primary mb-3">
                        Structured Over Scattered
                    </h3>
                    <p className="text-dark-text-secondary leading-relaxed">
                        I follow well-designed courses and textbooks rather than jumping between random tutorials.
                        This creates a coherent mental model of how different concepts connect, from linear algebra
                        foundations to state-of-the-art architectures.
                    </p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-dark-text-primary mb-3">
                        Implementation-First Mindset
                    </h3>
                    <p className="text-dark-text-secondary leading-relaxed">
                        Understanding comes from building. I rebuild models from scratch—writing backpropagation,
                        deriving gradient updates, implementing optimizers. This reveals the mechanics that high-level
                        APIs abstract away.
                    </p>
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-dark-text-primary mb-3">
                        Reasoning About Behavior
                    </h3>
                    <p className="text-dark-text-secondary leading-relaxed">
                        Every model has inductive biases. I focus on understanding why architectures make certain
                        decisions—how convolutions encode spatial hierarchy, why attention mechanisms work, what
                        loss functions optimize for. This thinking transfers across domains.
                    </p>
                </div>
            </div>
        </section>
    );
}
