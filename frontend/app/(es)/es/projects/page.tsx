import { ProjectsPage, projectsMetadata } from '@/components/pages/projects-page';

export const metadata = projectsMetadata('es');

export default function Page() {
	return <ProjectsPage lang="es" />;
}
