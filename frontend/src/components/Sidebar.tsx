import type { RefObject } from "react";
import ArchiveBlock from "./sidebar/ArchiveBlock";
import RecommendedBlock from "./sidebar/RecommendedBlock";
import SearchBlock from "./sidebar/SearchBlock";
import TagsBlock from "./sidebar/TagsBlock";

type SidebarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchRef: RefObject<HTMLInputElement | null>;
};

import "./Sidebar.css";

function Sidebar({ searchValue, onSearchChange, searchRef }: SidebarProps) {
  return (
    <aside className="sidebar">
      <SearchBlock searchValue={searchValue} onSearchChange={onSearchChange} searchRef={searchRef} />
      <RecommendedBlock />
      <TagsBlock />
      <ArchiveBlock />
    </aside>
  );
}

export default Sidebar;
