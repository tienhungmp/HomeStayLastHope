/**
 * Convert date from format YYYY-MM-DD to DD/MM/YYYY.
 * @param {string} dateStr date string in format YYYY-MM-DD.
 * @returns date string in format DD/MM/YYYY
 */
function transformDateStringIsoToLocale(dateStr) {
  const globalRegex = new RegExp("[0-9]{4}-[0-9]{2}-[0-9]{2}", "g");
  if (globalRegex.test(dateStr)) {
    let [year, month, day] = dateStr.split("-");
    return day + "/" + month + "/" + year;
  }

  return dateStr;
}

/**
 * Convert date from format DD/MM/YYYY to YYYY-MM-DD.
 * @param {string} dateStr date string in format DD/MM/YYYY.
 * @returns date string in format YYYY-MM-DD
 */
function transformDateStringLocaleToIso(dateStr) {
  const globalRegex = new RegExp("[0-9]{2}/[0-9]{2}/[0-9]{4}", "g");
  if (globalRegex.test(dateStr)) {
    let [day, month, year] = dateStr.split("/");
    return year + "-" + month + "-" + day;
  }

  return dateStr;
}

export { transformDateStringIsoToLocale, transformDateStringLocaleToIso };
