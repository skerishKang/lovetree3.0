const UUID_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

export function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const hex = "0123456789abcdef";
  const sections = [8, 4, 4, 4, 12];
  return sections
    .map((len) => {
      let s = "";
      for (let i = 0; i < len; i++) {
        s += hex[Math.floor(Math.random() * 16)];
      }
      return s;
    })
    .join("-");
}

export function isValidIdempotencyKey(key: string): boolean {
  return UUID_PATTERN.test(key);
}
