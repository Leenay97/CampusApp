function parseHouseNumber(value: string) {
  const match = value.match(/^(\d+)(.*)$/);
  if (!match) return { num: Number.MAX_SAFE_INTEGER, suffix: value };
  return { num: Number(match[1]), suffix: match[2] };
}

export function compareHouseNumbers(a: string, b: string): number {
  const parsedA = parseHouseNumber(a ?? '');
  const parsedB = parseHouseNumber(b ?? '');

  if (parsedA.num !== parsedB.num) return parsedA.num - parsedB.num;
  return parsedA.suffix.localeCompare(parsedB.suffix, 'ru');
}
