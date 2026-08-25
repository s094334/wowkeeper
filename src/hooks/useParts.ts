import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutateFunction } from "@tanstack/react-query";
import { deletePart, patchRenewPart, postPart, putPart } from "../api/parts";
import { getErrorMessage } from "../api/system";
import { applianceKeys } from "../constants/queryKeys";
import type { Part, PartInput } from "../types/appliance";

export type EditPartPayload = {
  partId: string;
  input: PartInput;
};

type UsePartMutationsResult = {
  isAdding: boolean;
  isEditing: boolean;
  isRemoving: boolean;
  isRenewing: boolean;
  errorLog: string[];
  addPart: UseMutateFunction<Part, Error, PartInput>;
  editPart: UseMutateFunction<void, Error, EditPartPayload>;
  removePart: UseMutateFunction<void, Error, string>;
  renewPart: UseMutateFunction<void, Error, string>;
};

export function usePartMutations(
  applianceId: string | undefined,
): UsePartMutationsResult {
  const queryClient = useQueryClient();
  const invalidateAppliances = () =>
    queryClient.invalidateQueries({ queryKey: applianceKeys.all });

  const addMutation = useMutation<Part, Error, PartInput>({
    mutationFn: (input) => postPart(applianceId!, input),
    onSettled: invalidateAppliances,
  });

  const editMutation = useMutation<void, Error, EditPartPayload>({
    mutationFn: ({ partId, input }) => putPart(applianceId!, partId, input),
    onSettled: invalidateAppliances,
  });

  const removeMutation = useMutation<void, Error, string>({
    mutationFn: (partId) => deletePart(applianceId!, partId),
    onSettled: invalidateAppliances,
  });

  const renewMutation = useMutation<void, Error, string>({
    mutationFn: (partId) => patchRenewPart(applianceId!, partId),
    onSettled: invalidateAppliances,
  });

  const errorLog = [
    addMutation.error,
    editMutation.error,
    removeMutation.error,
    renewMutation.error,
  ]
    .filter((error) => error !== null)
    .map(getErrorMessage);

  return {
    isAdding: addMutation.isPending,
    isEditing: editMutation.isPending,
    isRemoving: removeMutation.isPending,
    isRenewing: renewMutation.isPending,
    errorLog,
    addPart: addMutation.mutate,
    editPart: editMutation.mutate,
    removePart: removeMutation.mutate,
    renewPart: renewMutation.mutate,
  };
}
