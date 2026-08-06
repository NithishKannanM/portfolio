import ProjectCard from '../components/ProjectCard';

/**
 * Projects section - showcase of technical work
 * Each project highlights problem, insight, engineering focus, and implementation details
 */
export default function Projects() {
    const projects = [
        {
            title: "UrbanPulse – Decision-Centric Intelligence for Urban Electricity Distribution",
            problem: "Smart city electricity monitoring systems rely heavily on anomaly detection, which leads to alert fatigue and delayed or mistrusted operational decisions.",
            insight: "Shifting from detection-centric monitoring to regret-aware, confidence-calibrated decision-making enables timely and trustable interventions in urban power systems.",
            engineeringFocus: "Designed a decision-support system that analyzes urban electricity distribution logs and translates model outputs into explainable, regret-based action recommendations for human operators.",
            techStack: ["Python", "Deep Learning", "Time-Series Analysis", "Decision Logic", "System Log Analysis", "Dashboard Visualization"]
        },
        {
            title: "Adaptive Memory-Aware ML Inference Engine",
            problem: "ML models assume static resources, causing failures under real-world memory and latency constraints.",
            insight: "Dynamic control of precision, batch size, and execution paths enables stable inference without retraining.",
            engineeringFocus: "Built a runtime system that monitors memory and latency to adapt model behavior during inference.",
            techStack: ["Python", "TensorFlow", "Model Quantization", "Systems Monitoring", "Inference Optimization"]
        },
        {
            title: "CIFAR-100 Image Classification: CNNs from First Principles",
            problem: "Understanding convolution, pooling, normalization, and gradient flow beyond black-box deep learning APIs.",
            insight: "Manual implementation and analysis of CNN training reveals how local receptive fields evolve into hierarchical representations and where optimiz ation fails.",
            engineeringFocus: "Designed and trained CNNs with custom data augmentation, learning rate scheduling, and early stopping. Compared scratch training with pretrained ResNet-50 under resolution constraints.",
            techStack: ["Python", "NumPy", "TensorFlow", "CNNs", "Backpropagation", "Transfer Learning"],
            githubUrl: "https://github.com/NithishKannanM/cifar100_da_dp_sn"
        },
        {
            title: 'From Classical ML to Attention-Based NLP',
            problem: 'Classical ML approaches like TF-IDF+SVM ignore word order, while CNN-LSTM models compress sequences into a single timestep, causing information loss on noisy reviews.',
            insight: 'Attention mechanisms over LSTM hidden states remove the sequence bottleneck by learning which words matter most, improving training stability and generalization.',
            engineeringFocus: 'Implemented a progressive NLP system in PyTorch (SVM → CNN-LSTM → Attention-LSTM) with shared preprocessing pipeline. Built custom training loops with convergence tracking, exposed inference via Flask REST API, and added CI for reproducibility validation.',
            techStack: ['Python', 'PyTorch', 'Scikit-learn', 'Attention Mechanism', 'REST API', 'Flask', 'CI/CD'],
            githubUrl: 'https://github.com/NithishKannanM/ml-to-attention-nlp'
        }

    ];

    return (
        <section id="projects" className="section-container">
            <h2 className="heading-lg mb-12">Projects</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                    <ProjectCard key={project.title} {...project} />
                ))}
            </div>
        </section>
    );
}
