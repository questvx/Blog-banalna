import type { RefObject } from "react";
import RecommendedBlock from "./sidebar/RecommendedBlock";
import SearchBlock from "./sidebar/SearchBlock";
import TagsBlock from "./sidebar/TagsBlock";
import type { Post } from "../data/posts";

type SidebarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  categories?: string[];
  selectedCategories?: string[];
  onCategoryChange?: (category: string) => void;
  onRandomPost: () => void;
  onShowRecommended: () => void;
  posts: Post[];
};

import "./Sidebar.css";

function Sidebar({ searchValue, onSearchChange, searchRef, categories = [], selectedCategories = [], onCategoryChange, posts, onRandomPost, onShowRecommended }: SidebarProps) {
  return (
    <aside className="sidebar">
      <SearchBlock searchValue={searchValue} onSearchChange={onSearchChange} searchRef={searchRef} onRandomPost={onRandomPost} />
      <RecommendedBlock posts={posts} onShowRecommended={onShowRecommended} />
      {onCategoryChange && <TagsBlock categories={categories} selectedCategories={selectedCategories} onCategoryChange={onCategoryChange} />}
      {/* <ArchiveBlock /> */}
    </aside>
  );
}

export default Sidebar;
