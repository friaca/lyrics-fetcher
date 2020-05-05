export const sanitize = (text: string): string =>
  text.replace(/((?![a-zA-Z0-9 \u00C0-\u017F]).)/g, '');
