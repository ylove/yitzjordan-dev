import type { Metadata } from 'next'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { PRIVACY_NOTES } from '@/content/agents'
import { routeMetadata } from '@/lib/seo/metadata'

export const metadata: Metadata = routeMetadata('/privacy')

export default function PrivacyPage() {
  return (
    <Section labelledBy="page-title" spacing="none" containerWidth="measure" className="pb-20 md:pb-28">
      <div className="prose-yj pt-14 md:pt-20">
        <Heading level={1} id="page-title">
          Privacy
        </Heading>
        <p>This site is a personal portfolio. It sets no cookies for visitors and runs no analytics or advertising scripts. Its one form, the opportunity brief, is for hiring teams and their AI agents.</p>
        <h2>What is recorded</h2>
        <ul>
          {PRIVACY_NOTES.map((n) => (
            <li key={n}>{n}</li>
          ))}
          <li>The hosting provider (Vercel) keeps standard request logs for security and operations.</li>
          <li>An opportunity brief keeps the contact details and role information it was sent with, and the IP address only as a salted hash for rate limiting. Briefs that Yitz replied to or declined are deleted 90 days after their last change, unless he keeps one for an ongoing conversation.</li>
          <li>A link that opens the brief form already filled in carries the draft after the # sign. Browsers do not send that part to the server; nothing is stored until the form is submitted.</li>
          <li>YouTube videos load from youtube-nocookie.com, and only after you press play.</li>
        </ul>
        <h2>Requests</h2>
        <p>
          To have a brief or an introduction you sent through an AI agent deleted, message Yitz on{' '}
          <a href="https://www.linkedin.com/in/yitzjordan">LinkedIn</a>.
        </p>
      </div>
    </Section>
  )
}
