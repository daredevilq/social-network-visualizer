import WordCloud from 'react-d3-cloud';
import { useEffect, useMemo, useRef, useState } from 'react';

interface HashtagMostCommonWordsProps {
  words?: { [word: string]: number };
}

const colors = ['#FFFFFF', '#A5B4FC', '#CBD5E1', '#7140F4', '#BFDBFE'];
const fill = (word: { originalFill: string }) => word.originalFill;

export function HashtagMostCommonWordsContainer({ words }: HashtagMostCommonWordsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          setSize({ width: Math.floor(width), height: Math.floor(height) });
        }
      }
    });

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const transformedWords = useMemo(() => {
    if (!words) return [];
    return Object.entries(words).map(([text, value], index) => ({
      text,
      value,
      originalFill: colors[index % colors.length],
    }));
  }, [words]);

  const dynamicFontSizeMapper = useMemo(() => {
    if (!size || transformedWords.length === 0) {
      return () => 12;
    }

    const minFontSize = 14;
    const maxFontSize = Math.min(size.height / 4, 80);
    const counts = transformedWords.map((w) => w.value);
    const minVal = Math.max(1, Math.min(...counts));
    const maxVal = Math.max(...counts);

    const minLog = Math.log2(minVal);
    const maxLog = Math.log2(maxVal);
    const rangeLog = maxLog - minLog;
    const rangeFontSize = maxFontSize - minFontSize;

    return (word: { value: number }) => {
      if (rangeLog === 0) {
        return minFontSize;
      }
      const normalizedLog = (Math.log2(word.value) - minLog) / rangeLog;
      return minFontSize + normalizedLog * rangeFontSize;
    };
  }, [transformedWords, size]);

  if (!words) {
    return (
      <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg lg:col-span-2 border border-gray-700/50">
        <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2 flex items-center">Most Common Words</h2>
        <div ref={containerRef} className="h-80 flex items-center justify-center">
          <p className="text-gray-400 animate-pulse">Generating word cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#2A2D3D] rounded-xl p-6 shadow-lg lg:col-span-2 border border-gray-700/50">
      <h2 className="text-2xl font-semibold mb-6 border-b border-gray-600 pb-2 flex items-center">Most Common Words</h2>

      <div ref={containerRef} className="h-80 w-full overflow-hidden">
        {transformedWords.length > 0 ? (
          size && (
            <WordCloud
              data={transformedWords}
              width={size.width}
              height={size.height}
              font="Inter"
              fontWeight="bold"
              fill={fill}
              padding={2}
              rotate={0}
              fontSize={dynamicFontSizeMapper}
              onWordMouseOver={(event, d) => {
                const target = event.target as SVGElement;
                target.style.cursor = 'pointer';
              }}
              onWordMouseOut={(event, d) => {
                const target = event.target as SVGElement;
                target.style.cursor = 'default';
              }}
            />
          )
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <p className="text-gray-400">No words available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
