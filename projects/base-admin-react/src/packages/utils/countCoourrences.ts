/**
 * 计算一个单词searchWord在str中出现了几次
 * @date    2025-09-01 20:19
 */
export function countOccurrence(str: string, searchWord: string) {
  let count = 0;
  let position = 0;

  while ((position = str.indexOf(searchWord, position)) !== -1) {
    count++;
    position += searchWord.length;
  }

  return count;
}
