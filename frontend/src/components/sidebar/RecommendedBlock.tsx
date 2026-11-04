import "./RecommendedBlock.css";
import type { Post } from "../../data/posts";

type RecommendedBlockProps = {
  posts: Post[]
  onShowRecommended: () => void
}

function RecommendedBlock({ posts, onShowRecommended }: RecommendedBlockProps) {
  const recommendedPosts = posts
    .filter((post) => post.featured)
    .sort((postA, postB) => postB.date.localeCompare(postA.date))

  return (
    <div className="recommended-block">
      <p className="sidebar-label">Polecane wpisy</p>
      <ul className="recommended-list">
        {recommendedPosts.slice(0, 3).map((post) => (
          <li key={post.id}><a href={`#post-${post.id}`}>{post.title}</a></li>
        ))}
      </ul>
      {recommendedPosts.length > 3 && (
        <button className="recommended-more" type="button" onClick={onShowRecommended}>
          Zobacz Więcej
        </button>
      )}
    </div>
  );
}

export default RecommendedBlock;
