import seed from "@/mock/projects.json";
import View from "./view";

export const generateStaticParams = () => seed.flatMap((p) => p.stages.map((s) => ({ id: p.id, slug: s.slug })));

export default async function Page({ params }: { params: Promise<{ id: string; slug: string }> }) {
  return <View {...await params} />;
}
