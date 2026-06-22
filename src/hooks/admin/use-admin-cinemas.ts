import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminCinemaKeys,
  createCinema,
  deleteCinema,
  fetchAdminCinemas,
  updateCinema,
  type CreateCinemaInput,
} from "@/api/admin/cinemas";

export function useAdminCinemas() {
  return useQuery({
    queryKey: adminCinemaKeys.all,
    queryFn: fetchAdminCinemas,
  });
}

export function useCreateCinema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCinemaInput) => createCinema(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminCinemaKeys.all });
    },
  });
}

export function useUpdateCinema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateCinemaInput> }) =>
      updateCinema(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminCinemaKeys.all });
    },
  });
}

export function useDeleteCinema() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCinema(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminCinemaKeys.all });
    },
  });
}
