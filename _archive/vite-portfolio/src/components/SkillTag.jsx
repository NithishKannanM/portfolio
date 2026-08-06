export default function SkillTag({ skill, stars, proof }) {
    const renderStars = () => {
        const filled = '⭐';
        const empty = '☆';
        const totalStars = 5;
        const filledCount = stars || 0;

        return (
            <span className="text-xs ml-2" title={`Proficiency: ${filledCount}/5`}>
                {filled.repeat(filledCount)}{empty.repeat(totalStars - filledCount)}
            </span>
        );
    };

    return (
        <div className="px-4 py-2 text-sm border border-dark-border rounded-md text-dark-text-secondary hover:border-dark-text-muted hover:text-dark-text-primary transition-colors duration-200 group">
            <div className="flex items-center justify-between">
                <span className="font-medium">{skill}</span>
                {stars && renderStars()}
            </div>
            {proof && (
                <div className="text-xs text-dark-text-muted mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {proof}
                </div>
            )}
        </div>
    );
}
