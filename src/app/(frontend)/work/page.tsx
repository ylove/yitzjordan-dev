import type { Metadata } from 'next'
import { ProjectCard } from '@/components/pages/work/ProjectCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { Heading } from '@/components/ui/Heading'
import { Lead } from '@/components/ui/Lead'
import { Section } from '@/components/ui/Section'
import { getRoute } from '@/content/site'
import { getProjects } from '@/lib/cms'
import { breadcrumbJsonLd, itemListJsonLd, webPageJsonLd } from '@/lib/seo/jsonld'
import { routeMetadata } from '@/lib/seo/metadata'

export const revalidate = 3600

export const metadata: Metadata = routeMetadata('/work')

export default async function WorkPage() {
  const projects = await getProjects()
  const route = getRoute('/work')
  return (
    <>
      <Section labelledBy="page-title" spacing="none">
        <div className="pt-14 pb-10 md:pt-20 md:pb-12">
          <Heading level={1} id="page-title" className="max-w-[20ch]">
            Tools for teams putting AI agents to work
          </Heading>
          <Lead className="mt-6 max-w-[64ch]">
            Open-source software for the problems every team hits once AI agents do real work: getting several models to
            agree on a plan, answers you can verify, coding agents that stay inside policy, and bugs triaged before
            anyone opens Jira. Each page covers what the tool does, who it is for, how to install it, and the engineering
            decisions behind it. Vouch Networks, the company I founded, is where most of them began.
          </Lead>
        </div>
      </Section>
      <Section labelledBy="projects-title" spacing="none" className="pb-20 md:pb-28">
        <h2 id="projects-title" className="sr-only">
          Projects
        </h2>
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <li key={p.id} className={p.schemaType === 'organization' ? 'lg:col-span-2' : undefined}>
              <ProjectCard project={p} topics />
            </li>
          ))}
        </ul>
      </Section>
      <JsonLd
        data={[
          webPageJsonLd({
            path: '/work',
            type: 'CollectionPage',
            name: route.title,
            description: route.description,
            mainEntity: itemListJsonLd(projects.map((p) => ({ url: `/work/${p.slug}`, name: p.name }))),
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Work', path: '/work' },
          ]),
        ]}
      />
    </>
  )
}
