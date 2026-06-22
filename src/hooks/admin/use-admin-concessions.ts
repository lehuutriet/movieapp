import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  concessionQueryKeys,
  createConcessionWithImage,
  deleteConcession,
  getConcessions,
  updateConcessionWithImage,
  type CreateConcessionInput,
  type UpdateConcessionInput,
} from "@/api/concessions";

export interface CreateConcessionPayload {
  input: CreateConcessionInput;
  imageFile?: File;
}

export interface UpdateConcessionPayload {
  documentId: string;
  input: UpdateConcessionInput;
  imageFile?: File;
  previousImageUrl?: string;
}

export function useAdminConcessions() {
  return useQuery({
    queryKey: concessionQueryKeys.adminList(),
    queryFn: getConcessions,
  });
}

export function useCreateConcession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, imageFile }: CreateConcessionPayload) =>
      createConcessionWithImage(input, imageFile),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: concessionQueryKeys.all });
    },
  });
}

export function useUpdateConcession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      input,
      imageFile,
      previousImageUrl,
    }: UpdateConcessionPayload) =>
      updateConcessionWithImage(documentId, input, {
        imageFile,
        previousImageUrl,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: concessionQueryKeys.all });
    },
  });
}

export function useDeleteConcession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteConcession(documentId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: concessionQueryKeys.all });
    },
  });
}
