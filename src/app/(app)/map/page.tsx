import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { DummyMap } from "@/components/DummyMap";
import { PageHeader } from "@/components/PageHeader";

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string | string[] }>;
}) {
  const search = await searchParams;
  const persona = Array.isArray(search.as) ? search.as[0] : search.as;
  const action =
    persona === "driver"
      ? {
          title: "Driver action",
          body: "See open jobs in regions that suit your truck and preferred radius.",
          href: "/jobs",
          cta: "See regional jobs",
        }
      : persona === "landowner"
        ? {
            title: "Landowner action",
            body: "Use demand signals to decide where to promote available paddock capacity.",
            href: "/landowner",
            cta: "Open requests inbox",
          }
        : {
            title: "Livestock owner action",
            body: "Jump from regional pressure into paddocks that could take your stock.",
            href: "/listings?request=request-100-cattle",
            cta: "See paddocks",
          };

  return (
    <>
      <PageHeader
        eyebrow="Regional intelligence"
        title="Availability by region."
        description="A static map and heatmap placeholder for feed status, drought pressure and paddock availability. Real maps come later."
      />
      <Card className="mb-5 border-sage/30 bg-sage-mist/70">
        <h2 className="text-xl font-bold text-sage-deep">{action.title}</h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-bark/85">
          {action.body}
        </p>
        <ButtonLink href={action.href} variant="secondary" className="mt-4">
          {action.cta}
        </ButtonLink>
      </Card>
      <DummyMap />
    </>
  );
}
