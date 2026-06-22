import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminMovieKeys,
  createMovie,
  deleteMovie,
  fetchAdminMovies,
  updateMovie,
  type CreateMovieInput,
} from "@/api/admin/movies";

export function useAdminMovies() {
  return useQuery({
    queryKey: adminMovieKeys.all,
    queryFn: fetchAdminMovies,
  });
}

export function useCreateMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMovieInput) => createMovie(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminMovieKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}

export function useUpdateMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateMovieInput> }) =>
      updateMovie(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminMovieKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}

export function useDeleteMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMovie(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminMovieKeys.all });
      void queryClient.invalidateQueries({ queryKey: ["movies"] });
    },
  });
}
