'use client';
import { useMutation, MutationHookOptions } from '@apollo/client';
import { useLoading } from '@/contexts/LoadingContext';
import { LoadingType } from '@/app/types';

type GlobalLoadingMutationResult<TData, TVariables> = {
  loadingState: LoadingType | null;
} & ReturnType<typeof useMutation<TData, TVariables>>[1];

export function useGlobalLoadingMutation<TData, TVariables = Record<string, unknown>>(
  mutation: Parameters<typeof useMutation<TData, TVariables>>[0],
  options?: MutationHookOptions<TData, TVariables> & { autoCloseDelay?: number },
): [(variables?: TVariables) => Promise<TData>, GlobalLoadingMutationResult<TData, TVariables>] {
  const { showLoading, hideLoading } = useLoading();
  const autoCloseDelay = options?.autoCloseDelay ?? 1500;

  const [mutate, result] = useMutation<TData, TVariables>(mutation, {
    ...options,
    onCompleted: (data) => {
      showLoading('SUCCESS');
      options?.onCompleted?.(data);
      setTimeout(hideLoading, autoCloseDelay);
    },
    onError: (error) => {
      showLoading('ERROR');
      options?.onError?.(error);
      setTimeout(hideLoading, autoCloseDelay);
    },
  });

  const wrappedMutate = async (variables?: TVariables): Promise<TData> => {
    showLoading('LOADING');
    const response = await mutate({ variables });
    return response.data as TData;
  };

  const extendedResult: GlobalLoadingMutationResult<TData, TVariables> = {
    ...result,
    loadingState: result.loading ? 'LOADING' : null,
  };

  return [wrappedMutate, extendedResult];
}
