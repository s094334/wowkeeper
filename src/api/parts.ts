import axios from "axios";
import { partsUrl } from "../constants/apiUrl";
import type {
  CreatePartResponse,
  Part,
  PartInput,
  PartMessageResponse,
} from "../types/appliance";

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

export async function putPart(
  applianceId: string,
  partId: string,
  body: PartInput,
): Promise<void> {
  await axios.put<PartMessageResponse>(
    `${partsUrl(applianceId)}${partId}`,
    body,
  );
}

export async function deletePart(
  applianceId: string,
  partId: string,
): Promise<void> {
  await axios.delete<PartMessageResponse>(`${partsUrl(applianceId)}${partId}`);
}
