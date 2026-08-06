import BlogCard from '../components/BlogCard';

/**
 * Blog section - showcase of technical writing and insights
 * Displays blog posts with excerpts and metadata
 */
export default function Blog() {
    const blogPosts = [
        {
            title: "Understanding Attention Mechanisms: Beyond the Hype",
            date: "2026-01-15",
            excerpt: "A deep dive into how attention mechanisms work at a fundamental level, why they solve the sequence bottleneck problem, and when they actually make sense to use versus simpler architectures.",
            tags: ["Deep Learning", "NLP", "Attention"],
            slug: "understanding-attention-mechanisms"
        },
        {
            title: "Decision-Centric AI: Why Detection Isn't Enough",
            date: "2026-01-10",
            excerpt: "Exploring the shift from anomaly detection to regret-aware decision-making in production AI systems. How confidence calibration and explainability enable trustable interventions.",
            tags: ["AI Systems", "Decision Theory", "Production ML"],
            slug: "decision-centric-ai"
        },
        {
            title: "Building CNNs from Scratch: What You Learn",
            date: "2026-01-05",
            excerpt: "Implementing convolutional layers, backpropagation, and optimizers from first principles reveals the mechanics that high-level APIs hide. Here's what I discovered.",
            tags: ["Deep Learning", "CNNs", "From Scratch"],
            slug: "building-cnns-from-scratch"
        }
    ];

    return (
        <section id="blog" className="section-container">
            <h2 className="heading-lg mb-4">Technical Writing</h2>

            <p className="text-dark-text-secondary max-w-2xl mb-12">
                Deep dives into AI concepts, implementation insights, and lessons learned from building systems from scratch.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.map((post) => (
                    <BlogCard key={post.slug} {...post} />
                ))}
            </div>

            {/* Coming Soon Note - Remove when you add real posts */}
            <div className="mt-8 text-center">
                <p className="text-sm text-dark-text-muted italic">
                    More posts coming soon. Currently working on in-depth technical articles.
                </p>
            </div>
        </section>
    );
}
