import axios from "axios";
import { partsUrl } from "../constants/apiUrl";
import type { CreatePartResponse, Part, PartInput } from "../types/appliance";

export async function postPart(
  applianceId: string,
  body: PartInput,
): Promise<Part> {
  const { data } = await axios.post<CreatePartResponse>(
    partsUrl(applianceId),
    body,
  );
  return data.newPart;
}
