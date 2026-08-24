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

type UseApplianceMutationsResult = {
  isAdding: boolean;
  isEditing: boolean;
  isRemoving: boolean;
  errorLog: string[];
  addAppliance: UseMutateFunction<Appliance, Error, ApplianceInput>;
  editAppliance: UseMutateFunction<void, Error, EditAppliancePayload>;
  removeAppliance: UseMutateFunction<void, Error, string>;
};

/**
 * 只有寫入操作，不含列表查詢。詳情頁那種「只想刪除、不需要整份列表」的頁面用這支，
 * 才不會為了拿一個函式而多打一次 GET /api/appliances/。
 */
export function useApplianceMutations(): UseApplianceMutationsResult {
  const queryClient = useQueryClient();
  const invalidateAppliances = () =>
    queryClient.invalidateQueries({ queryKey: applianceKeys.all });

  // 三個 mutation 都用 onSettled 而不是 onSuccess：不管成功或失敗都重抓一次，
  // 這樣「後端其實寫進去了、但回應在路上斷掉」的情況畫面也不會停在舊資料。
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

  const errorLog = [addMutation.error, editMutation.error, removeMutation.error]
    .filter((error) => error !== null)
    .map(getErrorMessage);

  return {
    isAdding: addMutation.isPending,
    isEditing: editMutation.isPending,
    isRemoving: removeMutation.isPending,
    errorLog,
    addAppliance: addMutation.mutate,
    editAppliance: editMutation.mutate,
    removeAppliance: removeMutation.mutate,
  };
}

type UseAppliancesResult = UseApplianceMutationsResult & {
  appliances: Appliance[];
  isLoading: boolean;
};

/** 列表查詢 + 所有寫入操作。首頁那種需要完整清單的頁面用這支。 */
export function useAppliances(): UseAppliancesResult {
  const appliances = useQuery<Appliance[]>({
    queryKey: applianceKeys.all,
    queryFn: ({ signal }) => getAppliances({ signal }),
  });

  const mutations = useApplianceMutations();

  return {
    ...mutations,
    appliances: appliances.data ?? [],
    isLoading: appliances.isLoading,
    // 放在展開後面才會覆蓋掉 mutations 自己那份，把查詢的錯誤一起收進來。
    errorLog: appliances.error
      ? [getErrorMessage(appliances.error), ...mutations.errorLog]
      : mutations.errorLog,
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
