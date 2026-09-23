import "./RecommendedBlock.css";
import type { Post } from "../../data/posts";

type RecommendedBlockProps = {
  posts: Post[]
}

function RecommendedBlock({ posts }: RecommendedBlockProps) {
  const recommendedPosts = posts.filter((post) => post.featured)

  return (
    <div className="recommended-block">
      <p className="sidebar-label">Polecane wpisy</p>
      <ul className="recommended-list">
        {recommendedPosts.map((post) => (
          <li key={post.id}><a href={`#post-${post.id}`}>{post.title}</a></li>
        ))}
      </ul>
      <a className="text-link" href="#najnowsze">
        zobacz więcej <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
}

export default RecommendedBlock;
