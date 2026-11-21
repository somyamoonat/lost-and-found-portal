import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type GetItemsFilter, type ClaimSubmission, type ReportSubmission } from "./api";
import type { Item } from "./items";

export const itemQueryKeys = {
  all: ["items"] as const,
  lists: () => [...itemQueryKeys.all, "list"] as const,
  list: (filter?: GetItemsFilter) => [...itemQueryKeys.lists(), filter] as const,
  details: () => [...itemQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...itemQueryKeys.details(), id] as const,
  similar: (category: string, currentId: string) =>
    [...itemQueryKeys.all, "similar", category, currentId] as const,
  handedInToday: () => [...itemQueryKeys.all, "handedInToday"] as const,
  recentFound: () => [...itemQueryKeys.all, "recentFound"] as const,
};

/**
 * Hook to query items with TanStack Query.
 */
export function useItemsQuery(filter?: GetItemsFilter, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: itemQueryKeys.list(filter),
    queryFn: () => api.getItems(filter),
    enabled: options?.enabled !== false,
  });
}

/**
 * Hook to query item details by ID or reference code.
 */
export function useItemDetailQuery(idOrRef: string) {
  return useQuery({
    queryKey: itemQueryKeys.detail(idOrRef),
    queryFn: () => api.getItemById(idOrRef),
    enabled: !!idOrRef,
  });
}

/**
 * Hook to query similar items.
 */
export function useSimilarItemsQuery(category: string, currentId: string, limit = 4) {
  return useQuery({
    queryKey: itemQueryKeys.similar(category, currentId),
    queryFn: () => api.getSimilarItems(category, currentId, limit),
    enabled: !!category && !!currentId,
  });
}

/**
 * Hook to query items handed in today for the Home page.
 */
export function useHandedInTodayQuery() {
  return useQuery({
    queryKey: itemQueryKeys.handedInToday(),
    queryFn: () => api.getHandedInToday(),
  });
}

/**
 * Hook to query recent found items for the Home page showcase.
 */
export function useRecentFoundQuery() {
  return useQuery({
    queryKey: itemQueryKeys.recentFound(),
    queryFn: () => api.getRecentFound(),
  });
}

/**
 * Hook to submit a new report.
 */
export function useSubmitReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportSubmission) => api.submitReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemQueryKeys.all });
    },
  });
}

/**
 * Hook to submit a claim for an item.
 */
export function useSubmitClaimMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClaimSubmission }) =>
      api.submitClaim(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: itemQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: itemQueryKeys.lists() });
    },
  });
}

interface OptimisticApproveContext {
  previousDetails?: Item | null;
}

/**
 * Optimistic Approve Claim Mutation with rollback on failure.
 */
export function useApproveClaimMutation(options?: {
  onRollback?: (error: unknown, claimId: string) => void;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    unknown,
    { claimId: string; itemId?: string },
    OptimisticApproveContext
  >({
    mutationFn: ({ claimId, itemId }) => api.approveClaim(claimId, itemId),

    onMutate: async ({ itemId }) => {
      if (!itemId) return {};

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: itemQueryKeys.detail(itemId) });

      // Snapshot previous value
      const previousDetails = queryClient.getQueryData<Item | null>(itemQueryKeys.detail(itemId));

      // Optimistically update item status to verified
      if (previousDetails) {
        queryClient.setQueryData<Item>(itemQueryKeys.detail(itemId), {
          ...previousDetails,
          status: "verified",
        });
      }

      return { previousDetails };
    },

    onError: (err, { claimId, itemId }, context) => {
      // Rollback to previous value
      if (itemId && context?.previousDetails) {
        queryClient.setQueryData(itemQueryKeys.detail(itemId), context.previousDetails);
      }
      options?.onRollback?.(err, claimId);
    },

    onSettled: (_, __, { itemId }) => {
      if (itemId) {
        queryClient.invalidateQueries({ queryKey: itemQueryKeys.detail(itemId) });
      }
      queryClient.invalidateQueries({ queryKey: itemQueryKeys.lists() });
      options?.onSuccess?.();
    },
  });
}

interface OptimisticWithdrawContext {
  previousDetails?: Item | null;
}

/**
 * Optimistic Withdraw Report Mutation with rollback on failure.
 */
export function useWithdrawReportMutation(options?: {
  onRollback?: (error: unknown, itemId: string) => void;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    unknown,
    { itemId: string },
    OptimisticWithdrawContext
  >({
    mutationFn: ({ itemId }) => api.withdrawReport(itemId),

    onMutate: async ({ itemId }) => {
      await queryClient.cancelQueries({ queryKey: itemQueryKeys.detail(itemId) });

      const previousDetails = queryClient.getQueryData<Item | null>(itemQueryKeys.detail(itemId));

      // Optimistically remove or update detail
      if (previousDetails) {
        queryClient.setQueryData(itemQueryKeys.detail(itemId), null);
      }

      return { previousDetails };
    },

    onError: (err, { itemId }, context) => {
      // Rollback
      if (context?.previousDetails) {
        queryClient.setQueryData(itemQueryKeys.detail(itemId), context.previousDetails);
      }
      options?.onRollback?.(err, itemId);
    },

    onSettled: (_, __, { itemId }) => {
      queryClient.invalidateQueries({ queryKey: itemQueryKeys.detail(itemId) });
      queryClient.invalidateQueries({ queryKey: itemQueryKeys.lists() });
      options?.onSuccess?.();
    },
  });
}
