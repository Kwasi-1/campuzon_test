import type { ReactNode } from "react";

interface SellerPageTemplateProps {
  title: string;
  description?: ReactNode;
  headerActions?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
}

export function SellerPageTemplate({
  title,
  description,
  headerActions,
  sidebar,
  children,
}: SellerPageTemplateProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          {description ? (
            <p className="text-sm md:text-base text-gray-500 mt-1">
              {description}
            </p>
          ) : null}
        </div>
        {headerActions}
      </div>

      <div className="flex flex-col xl:flex-row gap-8 pb-10">
        {sidebar ? <aside className="xl:w-72 shrink-0">{sidebar}</aside> : null}
        <section className="flex-1 min-w-0">{children}</section>
      </div>
    </div>
  );
}

interface SellerSidebarPanelProps {
  title: string;
  children: ReactNode;
}

export function SellerSidebarPanel({
  title,
  children,
}: SellerSidebarPanelProps) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}
