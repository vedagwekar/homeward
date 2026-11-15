import seed from "@/mock/projects.json";
import View from "./view";

export const generateStaticParams = () => seed.map((p) => ({ id: p.id }));

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <View {...await params} />;
}
