/**
 * About section - concise introduction focusing on technical approach
 * Emphasizes structured learning and implementation-first mindset
 */
export default function About() {
    return (
        <section id="about" className="section-container">
            <h2 className="heading-lg mb-8">About</h2>

            <div className="max-w-3xl">
                <p className="text-lg text-dark-text-secondary leading-relaxed mb-6">
                    I'm a computer science undergraduate building AI systems with a strong focus on deep learning 
                    and system behavior, the approach is structured and implementation-first rebuilding models 
                    from scratch and reasoning carefully about data flow, gradients, failure modes, and inductive biases. 
                    The goal is to design decision-centric AI systems that prioritize robustness and clarity over superficial performance gains.
                </p>

            
            </div>
        </section>
    );
}
