import { createFileRoute, ClientOnly, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { getPublishedApp } from "@/lib/published.functions";

const Sandbox = lazy(() => import("@/components/Sandbox"));

export const Route = createFileRoute("/app/$slug")({
  loader: ({ params }) => getPublishedApp({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const title = loaderData?.title
      ? `${loaderData.title} — built with Toiri`
      : "Published app — Toiri";
    const description = "An app built from a chat with Toiri (তৈরি).";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: () => <Notice text="This app could not be loaded." />,
  notFoundComponent: () => <Notice text="This app link does not exist." />,
  component: PublishedApp,
});

function Notice({ text }: { text: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-950 px-6 text-center">
      <div>
        <p className="text-[14px] text-foreground/70">{text}</p>
        <Link to="/" className="mt-3 inline-block text-[13px] font-semibold text-primary">
          Build your own with Toiri
        </Link>
      </div>
    </div>
  );
}

function PublishedApp() {
  const app = Route.useLoaderData();
  if (!app) return <Notice text="This app link does not exist." />;

  return (
    <div className="flex h-screen w-screen flex-col bg-ink-950">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <span className="truncate font-display text-[13px] font-semibold text-foreground/80">
          {app.title}
        </span>
        <Link
          to="/"
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground"
        >
          Built with তৈরি Toiri
        </Link>
      </div>
      <div className="min-h-0 flex-1">
        <ClientOnly fallback={null}>
          <Suspense fallback={null}>
            <Sandbox view="preview" files={{ "/App.js": { code: app.code } }} />
          </Suspense>
        </ClientOnly>
      </div>
    </div>
  );
}
