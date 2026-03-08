"use client";

import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export const SearchInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // 同步 URL 参数变化
  useEffect(() => {
    const query = searchParams.get("query") || "";
    setSearchTerm(query);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const url = new URL(window.location.origin + "/search");
      url.searchParams.set("query", searchTerm.trim());
      const categoryId = searchParams.get("categoryId");
      if (categoryId) {
        url.searchParams.set("categoryId", categoryId);
      }
      router.push(url.toString());
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-[600px]">
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-4 py-2.5 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
          >
            <XIcon className="size-4 text-gray-500" />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={!searchTerm.trim()}
        className="px-5 py-2.5 bg-gray-100 border border-l-0 rounded-r-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SearchIcon className="size-5" />
      </button>
    </form>
  );
};