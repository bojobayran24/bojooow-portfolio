import Image from "next/image";
import { Award, Building2, CalendarCheck, MapPin } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import { certificate, imageSizes } from "@/data/data";

export function Certificate() {
  return (
    <section id="certificate" className="container-page scroll-mt-24 py-24">
      <SectionHeading
        eyebrow="Certificate"
        title="Certificate of Appreciation"
        description="Third-party recognition for the work that runs through this portfolio — designing and developing systems that improved how an office operates."
      />

      <div className="mx-auto mt-14 max-w-4xl">
        <article className="glass overflow-hidden rounded-3xl">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="relative">
              <div className="relative h-full min-h-64 bg-white/4">
                <Image
                  src={certificate.image}
                  alt={certificate.alt}
                  width={imageSizes.certificate.width}
                  height={imageSizes.certificate.height}
                  className="size-full object-cover"
                />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand ring-1 ring-brand/25">
                <Award className="size-3.5" />
                Official Recognition
              </span>

              <h3 className="font-display mt-4 text-xl font-semibold tracking-tight">
                {certificate.title}
              </h3>

              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-brand-3" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Issued by</dt>
                    <dd>{certificate.issuer}</dd>
                    <dd className="text-muted-foreground">{certificate.division}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CalendarCheck className="mt-0.5 size-4 shrink-0 text-brand-3" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Date</dt>
                    <dd>{certificate.date}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-3" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Venue</dt>
                    <dd>{certificate.venue}</dd>
                  </div>
                </div>
              </dl>

              <div className="mt-5 border-t border-white/8 pt-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {certificate.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-sm tracking-wide text-brand-3">
                    {certificate.signee}
                  </p>
                  <p className="text-xs text-muted-foreground">{certificate.signeeTitle}</p>
                </div>
                <Award className="size-8 text-white/15" />
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
