import type { CustomerKycInfo } from '@/types/installment-flow';

export type CccdOcrFields = Pick<
  CustomerKycInfo,
  'fullName' | 'cccdNumber' | 'dob' | 'gender' | 'permanentAddress'
>;

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

const findLabeledValue = (
  lines: string[],
  pattern: RegExp
): { value: string; lineIndex: number } | undefined => {
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(pattern);
    if (!match) continue;

    const value = (match[1] ?? match[2])?.trim();
    if (value) return { value, lineIndex: index };

    const nextLine = lines[index + 1]?.trim();
    if (nextLine) return { value: nextLine, lineIndex: index + 1 };
  }
};

const formatDate = (value: string) => {
  const match = value.match(/\b(\d{1,2})[/. -](\d{1,2})[/. -](\d{4})\b/);
  if (!match) return undefined;

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day)
  ) {
    return undefined;
  }

  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
};

export const parseCccdText = (text: string): Partial<CccdOcrFields> => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const normalizedText = normalize(text);
  const fields: Partial<CccdOcrFields> = {};

  const name = findLabeledValue(
    lines,
    /(?:ho\s*va\s*ten|họ\s*và\s*tên)(?:\s*\/\s*full\s*name)?\s*[:：-]?\s*(.*)|full\s*name\s*[:：-]?\s*(.*)/i
  );
  if (name) {
    fields.fullName = name.value
      .replace(/\s+/g, ' ')
      .toLocaleUpperCase('vi-VN');
  }

  const idNumber = text.match(/(?:\d[\s.-]*){12}/);
  if (idNumber) {
    const digits = idNumber[0].replace(/\D/g, '');
    if (digits.length === 12) fields.cccdNumber = digits;
  }

  const dob = findLabeledValue(
    lines,
    /(?:ngay\s*sinh|ngày\s*sinh)(?:\s*\/\s*date\s*of\s*birth)?\s*[:：-]?\s*(.*)|date\s*of\s*birth\s*[:：-]?\s*(.*)/i
  );
  const dateValue = formatDate(dob?.value ?? text);
  if (dateValue) fields.dob = dateValue;

  const gender = findLabeledValue(
    lines,
    /(?:gioi\s*tinh|giới\s*tính)(?:\s*\/\s*(?:sex|gender))?\s*[:：-]?\s*(.*)|(?:sex|gender)\s*[:：-]?\s*(.*)/i
  );
  if (gender) {
    const genderValue = normalize(gender.value);
    if (/\bnam\b/.test(genderValue)) fields.gender = 'Nam';
    else if (/\bnu\b/.test(genderValue)) fields.gender = 'Nữ';
  }

  const address = findLabeledValue(
    lines,
    /(?:noi\s*thuong\s*tru|nơi\s*thường\s*trú)(?:\s*\/\s*(?:place\s*of\s*residence|permanent\s*address))?\s*[:：-]?\s*(.*)|(?:permanent\s*address|place\s*of\s*residence)\s*[:：-]?\s*(.*)/i
  );
  if (address) {
    const addressValue = address.value
      .replace(/^(?:[:：/-]\s*)/, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (addressValue.length > 5) fields.permanentAddress = addressValue;
  }

  if (!fields.cccdNumber) {
    const labeledNumber = normalizedText.match(
      /(?:so|no)\s*(?:cccd)?\s*(\d{12})/
    );
    if (labeledNumber) fields.cccdNumber = labeledNumber[1];
  }

  return fields;
};

export const recognizeCccd = async (
  image: File,
  onProgress: (progress: number) => void
) => {
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('vie+eng', undefined, {
    logger: ({ progress }) => onProgress(Math.round(progress * 100)),
  });

  try {
    const {
      data: { text },
    } = await worker.recognize(image);
    return parseCccdText(text);
  } finally {
    await worker.terminate();
  }
};
