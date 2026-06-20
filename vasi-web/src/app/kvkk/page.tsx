import { InfoPage } from '@/components/InfoPage';
import { INFO_PAGES } from '@/lib/infoPages';

export const runtime = 'edge';

export default function Page() {
  return <InfoPage content={INFO_PAGES.kvkk} />;
}
