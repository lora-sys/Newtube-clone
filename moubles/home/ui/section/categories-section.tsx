"use client";

import { FilterCarouse } from "@/components/ui/filter-carousel";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface CategorySectionProps {
  categoryId?: string;
}

export const CategoriesSection = ({ categoryId }: CategorySectionProps) => {
  return (
    <Suspense
      fallback={<FilterCarouse isLoading data={[]} onSelect={() => {}} />}
    >
      <ErrorBoundary fallback={<p>Error</p>}>
        <CategoriesSectionSuspense categoryId={categoryId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const CategoriesSectionSuspense = ({ categoryId }: CategorySectionProps) => {
  const [categories] = trpc.categories.getMany.useSuspenseQuery();
  const router = useRouter();
  const data =
    categories?.map(({ name, id }) => ({
      value: id,
      label: name,
    })) ?? [];

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("categoryId", value);
    } else {
      url.searchParams.delete("categoryId");
    }
    router.push(url.toString());
  };
  return (
    <FilterCarouse
      value={categoryId}
      data={data}
      onSelect={onSelect}
    />
  );
};
