import { ProjectPage, projectMetadata, projectParams } from '@/components/pages/project-page';

export const dynamicParams = false;

export function generateStaticParams() {
	return projectParams('es');
}

export async function generateMetadata({ params }: PageProps<'/es/projects/[slug]'>) {
	return projectMetadata('es', (await params).slug);
}

export default async function Page({ params }: PageProps<'/es/projects/[slug]'>) {
	return <ProjectPage lang="es" slug={(await params).slug} />;
}
