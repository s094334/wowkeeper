import axios from "axios";
import { PARTS_URL } from "../constants/apiUrl";
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
    PARTS_URL(applianceId),
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
    `${PARTS_URL(applianceId)}${partId}`,
    body,
  );
}

export async function deletePart(
  applianceId: string,
  partId: string,
): Promise<void> {
  await axios.delete<PartMessageResponse>(`${PARTS_URL(applianceId)}${partId}`);
}

export async function patchRenewPart(
  applianceId: string,
  partId: string,
): Promise<void> {
  await axios.patch<PartMessageResponse>(
    `${PARTS_URL(applianceId)}${partId}/renew`,
  );
}
