import { RootShell, rootMetadata, rootViewport } from '@/components/root-shell';

export const metadata = rootMetadata;
export const viewport = rootViewport;

export default function Layout({ children }: { children: React.ReactNode }) {
	return <RootShell lang="en">{children}</RootShell>;
}
