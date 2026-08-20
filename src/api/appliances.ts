import { APPLIANCES } from "../data/appliances";

export function findAppliance(id: string | undefined) {
  return APPLIANCES.find((item) => item.id === id);
}
