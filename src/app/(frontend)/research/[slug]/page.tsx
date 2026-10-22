import { articleRoute } from '@/components/pages/writing/article-route'

export const revalidate = 3600

const route = articleRoute('research')

export const generateStaticParams = route.generateStaticParams
export const generateMetadata = route.generateMetadata
export default route.Page
