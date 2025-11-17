import BaseMostCommonWordsContainer from '@/app/components/Analysis/BaseMostCommonWordsContainer';

interface MostCommonWordsProps {
  words?: { [word: string]: number };
}

export function UserMostCommonWordsContainer({ words }: MostCommonWordsProps) {
  return <BaseMostCommonWordsContainer words={words} title="Most Common Words" containerClassName="lg:col-span-2" />;
}
