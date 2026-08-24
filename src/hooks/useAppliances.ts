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

export function useApplianceMutations(): UseApplianceMutationsResult {
  const queryClient = useQueryClient();
  const invalidateAppliances = () =>
    queryClient.invalidateQueries({ queryKey: applianceKeys.all });

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

export function useAppliance(id: string | undefined): UseApplianceResult {
  const query = useQuery<Appliance>({
    queryKey: applianceKeys.detail(id ?? ""),
    // enabled 已經擋掉沒有 id 的情況，queryFn 只會在 id 有值時被呼叫。
    queryFn: ({ signal }) => getAppliance(id!, { signal }),
    enabled: Boolean(id),
  });

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
