import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseMutateFunction } from "@tanstack/react-query";
import axios from "axios";
import {
  deleteAppliance,
  getAppliance,
  getAppliances,
  postAppliance,
  putAppliance,
} from "../api/appliances";
import { getErrorMessage } from "../api/system";
import { applianceKeys } from "../constants/queryKeys";
import type { Appliance, ApplianceInput } from "../types/appliance";

export type EditAppliancePayload = {
  id: string;
  input: ApplianceInput;
};

type UseAppliancesResult = {
  appliances: Appliance[];
  isLoading: boolean;
  isAdding: boolean;
  isEditing: boolean;
  isRemoving: boolean;
  errorLog: string[];
  addAppliance: UseMutateFunction<Appliance, Error, ApplianceInput>;
  editAppliance: UseMutateFunction<void, Error, EditAppliancePayload>;
  removeAppliance: UseMutateFunction<void, Error, string>;
};

export function useAppliances(): UseAppliancesResult {
  const queryClient = useQueryClient();
  const invalidateAppliances = () =>
    queryClient.invalidateQueries({ queryKey: applianceKeys.all });

  const appliances = useQuery<Appliance[]>({
    queryKey: applianceKeys.all,
    queryFn: ({ signal }) => getAppliances({ signal }),
  });

  const addMutation = useMutation<Appliance, Error, ApplianceInput>({
    mutationFn: postAppliance,
    onSettled: invalidateAppliances,
  });

  const editMutation = useMutation<void, Error, EditAppliancePayload>({
    mutationFn: ({ id, input }) => putAppliance(id, input),
    onSettled: invalidateAppliances,
  });

  const removeMutation = useMutation<void, Error, string>({
    mutationFn: deleteAppliance,
    onSettled: invalidateAppliances,
  });

  const errorLog = [
    appliances.error,
    addMutation.error,
    editMutation.error,
    removeMutation.error,
  ]
    .filter((error) => error !== null)
    .map(getErrorMessage);

  return {
    appliances: appliances.data ?? [],
    isLoading: appliances.isLoading,
    isAdding: addMutation.isPending,
    isEditing: editMutation.isPending,
    isRemoving: removeMutation.isPending,
    errorLog,
    addAppliance: addMutation.mutate,
    editAppliance: editMutation.mutate,
    removeAppliance: removeMutation.mutate,
  };
}

type UseApplianceResult = {
  appliance: Appliance | undefined;
  isLoading: boolean;
  isNotFound: boolean;
  errorLog: string[];
};

/** 詳情頁用：單獨抓一台家電。列表的快取幫不上忙，直接開網址進來時列表根本還沒抓過。 */
export function useAppliance(id: string | undefined): UseApplianceResult {
  const query = useQuery<Appliance>({
    queryKey: applianceKeys.detail(id ?? ""),
    // enabled 已經擋掉沒有 id 的情況，queryFn 只會在 id 有值時被呼叫。
    queryFn: ({ signal }) => getAppliance(id!, { signal }),
    enabled: Boolean(id),
  });

  // 404 代表「這台家電不存在」，要顯示專屬畫面而不是紅色錯誤訊息，所以跟其他錯誤分開。
  const isNotFound =
    !id ||
    (axios.isAxiosError(query.error) && query.error.response?.status === 404);

  return {
    appliance: query.data,
    isLoading: query.isLoading,
    isNotFound,
    errorLog: query.error && !isNotFound ? [getErrorMessage(query.error)] : [],
  };
}
