import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UseMutateFunction } from "@tanstack/react-query";
import {
  deleteAppliance,
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
