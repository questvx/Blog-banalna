import type { RefObject } from "react";
import ArchiveBlock from "./sidebar/ArchiveBlock";
import RecommendedBlock from "./sidebar/RecommendedBlock";
import SearchBlock from "./sidebar/SearchBlock";
import TagsBlock from "./sidebar/TagsBlock";

type SidebarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
  categories?: string[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
};

import "./Sidebar.css";

function Sidebar({ searchValue, onSearchChange, searchRef, categories = [], selectedCategory = 'wszystkie', onCategoryChange }: SidebarProps) {
  return (
    <aside className="sidebar">
      <SearchBlock searchValue={searchValue} onSearchChange={onSearchChange} searchRef={searchRef} />
      <RecommendedBlock />
      {onCategoryChange && <TagsBlock categories={categories} selectedCategory={selectedCategory} onCategoryChange={onCategoryChange} />}
      <ArchiveBlock />
    </aside>
  );
}

export default Sidebar;
