import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseMutateFunction } from "@tanstack/react-query";
import { postPart } from "../api/parts";
import { getErrorMessage } from "../api/system";
import { applianceKeys } from "../constants/queryKeys";
import type { Part, PartInput } from "../types/appliance";

type UsePartMutationsResult = {
  isAdding: boolean;
  errorLog: string[];
  addPart: UseMutateFunction<Part, Error, PartInput>;
};

export function usePartMutations(
  applianceId: string | undefined,
): UsePartMutationsResult {
  const queryClient = useQueryClient();

  const addMutation = useMutation<Part, Error, PartInput>({
    mutationFn: (input) => postPart(applianceId!, input),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: applianceKeys.all }),
  });

  return {
    isAdding: addMutation.isPending,
    errorLog: addMutation.error ? [getErrorMessage(addMutation.error)] : [],
    addPart: addMutation.mutate,
  };
}
