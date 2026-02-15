import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client with sensible defaults for a charity portal:
 * - 5 min stale time (data doesn't go stale too fast)
 * - 1 retry (avoid hammering backend)
 * - No refetch on window focus (avoid UX surprises with modals)
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,       // 5 minutes
            gcTime: 10 * 60 * 1000,          // 10 minutes (garbage collection)
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
        mutations: {
            retry: 0,
        },
    },
});

export default queryClient;
