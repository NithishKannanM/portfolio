/**
 * BlogCard component for displaying individual blog post previews
 * Shows title, date, excerpt, tags, and read more link
 */
export default function BlogCard({ title, date, excerpt, tags, slug }) {
    return (
        <article className="border border-dark-border rounded-lg p-6 hover:border-dark-text-muted transition-colors duration-200 bg-dark-surface">
            {/* Post Date */}
            <time className="text-xs text-dark-text-muted uppercase tracking-wide">
                {date}
            </time>

            {/* Post Title */}
            <h3 className="heading-sm mt-2 mb-3">{title}</h3>

            {/* Excerpt */}
            <p className="text-dark-text-secondary text-sm leading-relaxed mb-4">
                {excerpt}
            </p>

            {/* Tags */}
            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 text-xs border border-dark-border rounded text-dark-text-muted"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Read More Link */}
            <a
                href={slug ? `#blog/${slug}` : '#blog'}
                className="inline-flex items-center text-sm text-dark-text-primary hover:text-dark-text-secondary transition-colors"
            >
                Read More →
            </a>
        </article>
    );
}
