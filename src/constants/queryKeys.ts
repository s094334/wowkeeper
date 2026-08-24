export const applianceKeys = {
  all: ["appliances"] as const,
  detail: (id: string) => ["appliances", id] as const,
};
