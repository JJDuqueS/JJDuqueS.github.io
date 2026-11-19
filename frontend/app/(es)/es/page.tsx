import { HomePage, homeMetadata } from '@/components/pages/home-page';

export const metadata = homeMetadata('es');

export default function Page() {
	return <HomePage lang="es" />;
}
