import { useQuery } from "@tanstack/react-query";
import {
  adminBookingQueryKeys,
  fetchAdminBookings,
} from "@/api/admin/bookings";

export function useAdminBookings() {
  return useQuery({
    queryKey: adminBookingQueryKeys.all,
    queryFn: fetchAdminBookings,
  });
}
