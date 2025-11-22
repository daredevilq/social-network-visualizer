import BaseMostCommonWordsContainer from '@/app/components/Analysis/BaseMostCommonWordsContainer';

interface HashtagMostCommonWordsProps {
  words?: { [word: string]: number };
}

export function HashtagMostCommonWordsContainer({ words }: HashtagMostCommonWordsProps) {
  return <BaseMostCommonWordsContainer words={words} title="Most Common Words" containerClassName="lg:col-span-2" />;
}
