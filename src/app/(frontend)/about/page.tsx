import type { Metadata } from 'next'
import Image from 'next/image'
import { RichText } from '@/components/richtext/RichText'
import { JsonLd } from '@/components/seo/JsonLd'
import { CtaPair } from '@/components/ui/CtaPair'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { CTAS } from '@/content/site'
import { DEFAULT_PROFILE } from '@/content/profile'
import { getProfile, getSkills, mediaOf } from '@/lib/cms'
import { formatMonth } from '@/lib/format'
import { breadcrumbJsonLd, personJsonLd, profilePageJsonLd } from '@/lib/seo/jsonld'
import { routeMetadata } from '@/lib/seo/metadata'
import type { Skill } from '@/payload-types'

export const revalidate = 3600

export const metadata: Metadata = routeMetadata('/about', { type: 'website' })

const GROUP_LABELS: Record<Skill['group'], string> = {
  ai: 'AI and agents',
  engineering: 'Application engineering',
  frontend: 'Front end',
  platform: 'Data, cloud and security',
  leadership: 'Leadership and product',
}

export default async function AboutPage() {
  const [profile, skills] = await Promise.all([getProfile(), getSkills()])
  const photo = mediaOf(profile?.photo)
  const experience = profile?.experience ?? []
  const highlights = profile?.highlights?.map((h) => h.text) ?? [...DEFAULT_PROFILE.highlights]
  const groups = (Object.keys(GROUP_LABELS) as Skill['group'][])
    .map((g) => ({ key: g, label: GROUP_LABELS[g], skills: skills.filter((s) => s.group === g) }))
    .filter((g) => g.skills.length)

  return (
    <>
      <Section labelledBy="page-title" spacing="none">
        <div className="grid gap-10 pt-14 pb-12 md:pt-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <Heading level={1} id="page-title">
              About
            </Heading>
            <p className="mt-6 max-w-[60ch] text-lead text-ink-muted">{profile?.intro ?? DEFAULT_PROFILE.intro}</p>
          </div>
          {photo ? (
            <div className="lg:col-span-3 lg:col-start-10">
              <Image
                src={photo.url}
                alt={photo.alt || 'Yitz Jordan'}
                width={photo.width ?? 480}
                height={photo.height ?? 600}
                sizes="(min-width: 1024px) 240px, 200px"
                className="w-[200px] rounded-card border border-line object-cover lg:w-full"
                priority
              />
            </div>
          ) : null}
        </div>
      </Section>

      <Section labelledBy="story-title" hairline spacing="compact">
        <h2 id="story-title" className="sr-only">
          Background
        </h2>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            {profile?.about ? <RichText data={profile.about as never} /> : null}
          </div>
          <aside aria-label="Highlights" className="lg:col-span-4 lg:col-start-9">
            <p className="text-small font-medium text-ink">Highlights</p>
            <ul className="mt-4 space-y-4 border-t border-line pt-4">
              {highlights.map((h) => (
                <li key={h} className="text-small text-ink-muted">
                  {h}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>

      {experience.length ? (
        <Section labelledBy="experience-title" hairline spacing="compact">
          <Heading level={2} id="experience-title">
            Experience
          </Heading>
          <ol className="mt-8 border-b border-line">
            {experience.map((e) => (
              <li key={e.id ?? `${e.title}-${e.start}`} className="grid gap-2 border-t border-line py-6 md:grid-cols-12 md:gap-8">
                <p className="text-data text-ink-subtle md:col-span-3 md:pt-1">
                  {formatMonth(e.start)}
                  {' to '}
                  {e.end ? formatMonth(e.end) : 'present'}
                </p>
                <div className="md:col-span-8">
                  <h3 className="text-h4 text-ink">
                    {e.title}
                    <span className="font-normal text-ink-muted">
                      {', '}
                      {e.display === 'named' && e.orgName
                        ? e.orgUrl
                          ? <a href={e.orgUrl} className="underline decoration-line-strong underline-offset-4 hover:decoration-accent" target="_blank" rel="noopener">{e.orgName}</a>
                          : e.orgName
                        : e.genericLabel}
                    </span>
                  </h3>
                  {e.summary ? <p className="mt-1.5 text-body text-ink-muted">{e.summary}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      ) : null}

      {groups.length ? (
        <Section labelledBy="skills-title" hairline spacing="compact">
          <Heading level={2} id="skills-title">
            Skills
          </Heading>
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((g) => (
              <div key={g.key}>
                <h3 className="text-h4 text-ink">{g.label}</h3>
                <p className="mt-2 text-body text-ink-muted">{g.skills.map((s) => s.name).join(', ')}</p>
              </div>
            ))}
          </div>
          {profile?.languages?.length ? (
            <p className="mt-10 text-small text-ink-muted">Languages: {profile.languages.map((l) => l.name).join(', ')}</p>
          ) : null}
        </Section>
      ) : null}

      <Section labelledBy="contact-title" hairline spacing="compact">
        <Heading level={2} size="h3" id="contact-title">
          Get in touch
        </Heading>
        <p className="mt-3 max-w-[56ch] text-body text-ink-muted">
          LinkedIn is the best way to reach me. If you are using an AI assistant, it can send an introduction through
          this site&rsquo;s MCP server.
        </p>
        <CtaPair primary={CTAS.linkedin} secondary={{ id: 'agents', label: 'For AI agents', href: '/agents' }} size="md" className="mt-6" />
      </Section>

      <JsonLd
        data={[
          profilePageJsonLd(profile),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
          personJsonLd(profile, { full: true, skills, imageUrl: photo?.url, onProfilePage: true }),
        ]}
      />
    </>
  )
}
