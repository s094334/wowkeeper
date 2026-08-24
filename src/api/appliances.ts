import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { APPLIANCES_URL } from "../constants/apiUrl";
import { APPLIANCES } from "../data/appliances";
import type {
  Appliance,
  ApplianceInput,
  ApplianceMessageResponse,
  CreateApplianceResponse,
  GetApplianceResponse,
  ListAppliancesResponse,
} from "../types/appliance";

export async function getAppliances(
  config: AxiosRequestConfig,
): Promise<Appliance[]> {
  const { data } = await axios.get<ListAppliancesResponse>(
    APPLIANCES_URL,
    config,
  );
  return data.data;
}

export async function getAppliance(
  id: string,
  config: AxiosRequestConfig,
): Promise<Appliance> {
  const { data } = await axios.get<GetApplianceResponse>(
    `${APPLIANCES_URL}${id}`,
    config,
  );
  return data.data;
}

export async function postAppliance(body: ApplianceInput): Promise<Appliance> {
  const { data } = await axios.post<CreateApplianceResponse>(
    APPLIANCES_URL,
    body,
  );
  return data.newAppliance;
}

export async function putAppliance(
  id: string,
  body: ApplianceInput,
): Promise<void> {
  await axios.put<ApplianceMessageResponse>(`${APPLIANCES_URL}${id}`, body);
}

export async function deleteAppliance(id: string): Promise<void> {
  await axios.delete<ApplianceMessageResponse>(`${APPLIANCES_URL}${id}`);
}

export function findAppliance(id: string | undefined) {
  return APPLIANCES.find((item) => item.id === id);
}
