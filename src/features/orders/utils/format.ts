export const formatSek = (n: number) =>
  new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" }).format(n);

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

