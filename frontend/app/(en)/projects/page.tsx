import { ProjectsPage, projectsMetadata } from '@/components/pages/projects-page';

export const metadata = projectsMetadata('en');

export default function Page() {
	return <ProjectsPage lang="en" />;
}
