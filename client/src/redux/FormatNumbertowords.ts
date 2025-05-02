const UNITS: string[] = ["", "UN", "DEUX", "TROIS", "QUATRE", "CINQ", "SIX", "SEPT", "HUIT", "NEUF"];
const TENS: string[] = ["", "DIX", "VINGT", "TRENTE", "QUARANTE", "CINQUANTE", "SOIXANTE", "SOIXANTE", "QUATRE-VINGT", "QUATRE-VINGT"];
const TEENS: string[] = ["DIX", "ONZE", "DOUZE", "TREIZE", "QUATORZE", "QUINZE", "SEIZE", "DIX-SEPT", "DIX-HUIT", "DIX-NEUF"];

function convertLessThan100(n: number): string {
  if (n < 10) return UNITS[n];
  if (n < 20) return TEENS[n - 10];
  const ten = Math.floor(n / 10);
  const unit = n % 10;
  if (ten === 7 || ten === 9) {
    return TENS[ten] + (unit ? "-" + TEENS[unit] : "-DIX");
  }
  let sep = unit === 1 && ten !== 8 ? " ET " : unit ? "-" : "";
  return TENS[ten] + sep + UNITS[unit];
}

function convertLessThan1000(n: number): string {
  if (n === 0) return "";
  if (n < 100) return convertLessThan100(n);
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  let result = "";
  if (hundreds === 1) result = "CENT";
  else result = UNITS[hundreds] + " CENT" + (rest === 0 ? "S" : "");
  if (rest > 0) result += " " + convertLessThan100(rest);
  return result;
}

function numberToFrenchWords(n: number): string {
  if (n === 0) return "ZÉRO";
  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  let words = "";
  if (thousands === 1) words += "MILLE";
  else if (thousands > 1) words += convertLessThan1000(thousands) + " MILLE";
  if (rest > 0) words += " " + convertLessThan1000(rest);
  return words.trim();
}

export const formatNumberToWords = (num: number): string => {
  const dirhams = Math.floor(num);
  const centimes = Math.round((num - dirhams) * 100);

  const dirhamWords = numberToFrenchWords(dirhams).toUpperCase();
  const centimesStr = centimes.toString().padStart(2, "0");

  return `${dirhamWords} DIRHAMS, ${centimesStr} CTS`;
};
