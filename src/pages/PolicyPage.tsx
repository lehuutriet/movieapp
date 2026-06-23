import { Link } from "react-router-dom";
import { isPolicySlug, POLICY_DOCUMENTS } from "@/data/policy-content";

interface PolicyPageProps {
  slug: string;
}

export function PolicyPage({ slug }: PolicyPageProps) {
  if (!isPolicySlug(slug)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-cinema text-2xl font-bold text-white">Không tìm thấy trang</h1>
        <Link to="/home" className="mt-4 inline-block text-sm text-amber-400 hover:text-amber-300">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const policy = POLICY_DOCUMENTS[slug];

  return (
    <div className="min-h-screen text-white">
      <section className="border-b border-orange-900/30 bg-black/30 px-4 py-10 md:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-orange-400">Pháp lý</p>
          <h1 className="font-cinema mt-2 text-2xl font-bold md:text-3xl">{policy.title}</h1>
          <p className="mt-2 text-sm text-stone-400">{policy.subtitle}</p>
          <p className="mt-3 text-xs text-stone-500">Cập nhật lần cuối: {policy.lastUpdated}</p>
        </div>
      </section>

      <main className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <div className="space-y-8">
          {policy.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-amber-300">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-relaxed text-stone-300">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4 border-t border-stone-800 pt-8 text-sm">
          {Object.values(POLICY_DOCUMENTS)
            .filter((doc) => doc.slug !== slug)
            .map((doc) => (
              <Link
                key={doc.slug}
                to={`/policy/${doc.slug}`}
                className="text-amber-400 transition hover:text-amber-300"
              >
                {doc.title}
              </Link>
            ))}
        </div>
      </main>
    </div>
  );
}
