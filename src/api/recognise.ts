import axios from "axios";
import type { ApplianceCategory } from "../types/appliance";
import { compressImage } from "../lib/compressImage";
import { RECOGNISE_URL } from "../constants/apiUrl";
import type { ApiErrorBody } from "../types/form";

export type RecogniseResult = {
  brand: string | null;
  model: string | null;
  productName: string | null;
  category: ApplianceCategory | null;
};

const FALLBACK_MESSAGE = "辨識失敗，請稍後再試";

export async function recogniseNameplate(file: File): Promise<RecogniseResult> {
  const image = await compressImage(file);

  try {
    const { data } = await axios.post<RecogniseResult>(RECOGNISE_URL, image, {
      headers: { "Content-Type": "image/jpeg" },
    });
    return data;
  } catch (error) {
    const message = axios.isAxiosError<ApiErrorBody>(error)
      ? error.response?.data?.message
      : undefined;
    throw new Error(message || FALLBACK_MESSAGE, { cause: error });
  }
}
