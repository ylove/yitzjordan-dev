import { publicResume } from '@/lib/agents/tools'

export const revalidate = 3600

/** JSON Resume: public work history, skills and projects. No email, phone or address. */
export async function GET() {
  return Response.json(await publicResume(), {
    headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
