export interface ReadingTimeResult {
  minutes: number;
  words: number;
}

export function calculateReadingTime(content: string = ""): ReadingTimeResult {
  if (!content) {
    return { minutes: 1, words: 0 };
  }

  // Remove code blocks and markdown symbols for cleaner word count
  const cleanText = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`.*?`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/[#*>\-_~]/g, "");

  // Match Chinese / CJK characters
  const cjkMatches = cleanText.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g) || [];
  const cjkCount = cjkMatches.length;

  // Match non-CJK words (English words, numbers)
  const nonCjkText = cleanText.replace(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g, " ");
  const wordMatches = nonCjkText.match(/\b\w+\b/g) || [];
  const wordCount = wordMatches.length;

  const totalWords = cjkCount + wordCount;
  // Average reading speed: ~300 CJK chars/min, ~200 non-CJK words/min
  const minutes = Math.max(1, Math.ceil(cjkCount / 300 + wordCount / 200));

  return {
    minutes,
    words: totalWords,
  };
}
