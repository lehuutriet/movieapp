import type { Promotion, PromotionCategory } from "@/types/promotion";

export type { Promotion, PromotionCategory };

export const PROMOTION_CATEGORY_LABELS: Record<PromotionCategory, string> = {
  ticket: "Vé phim",
  combo: "Combo F&B",
  member: "Thành viên",
};

export const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: "promo_1",
    title: "Thứ 3 Vui Vẻ",
    description: "Giảm 30% vé 2D cho tất cả suất chiếu vào thứ Ba hàng tuần.",
    category: "ticket",
    discountLabel: "-30%",
    code: "T3VUIVE",
    validUntil: "2026-12-31",
    imageUrl: "/images/theater-seats.jpg",
    terms: [
      "Áp dụng cho vé 2D, tối đa 4 vé mỗi giao dịch.",
      "Không áp dụng đồng thời với ưu đãi khác.",
      "Không áp dụng ngày lễ, Tết.",
    ],
  },
  {
    id: "promo_2",
    title: "Combo Đôi Bạn Thân",
    description: "2 vé + 2 bắp lớn + 2 nước chỉ với giá ưu đãi đặc biệt.",
    category: "combo",
    discountLabel: "199.000đ",
    validUntil: "2026-09-30",
    imageUrl: "/images/popcorn.jpg",
    terms: [
      "Áp dụng tại quầy F&B hoặc khi đặt online kèm vé.",
      "Giá có thể thay đổi theo từng rạp.",
    ],
  },
  {
    id: "promo_3",
    title: "Sinh nhật Cine Hall",
    description: "Tặng 1 vé miễn phí trong tháng sinh nhật của bạn.",
    category: "member",
    discountLabel: "Miễn phí 1 vé",
    code: "SNCINEHALL",
    validUntil: "2026-12-31",
    imageUrl: "/images/clapper.jpg",
    terms: [
      "Cần xác minh ngày sinh trong tài khoản.",
      "Áp dụng 1 lần trong tháng sinh nhật.",
      "Vé 2D tiêu chuẩn, ghế thường.",
    ],
  },
  {
    id: "promo_4",
    title: "Học sinh - Sinh viên",
    description: "Giảm 20% vé khi xuất trình thẻ HS/SV tại quầy.",
    category: "ticket",
    discountLabel: "-20%",
    validUntil: "2026-08-31",
    imageUrl: "/images/theater-seats.jpg",
    terms: [
      "Áp dụng từ thứ Hai đến thứ Năm.",
      "Mỗi thẻ được mua tối đa 2 vé/ngày.",
    ],
  },
  {
    id: "promo_5",
    title: "Gia đình Cuối tuần",
    description: "Mua 3 vé trở lên được giảm thêm 15% tổng hóa đơn.",
    category: "ticket",
    discountLabel: "-15%",
    code: "GIADINH",
    validUntil: "2026-10-31",
    imageUrl: "/images/theater-seats.jpg",
    terms: [
      "Áp dụng Thứ Bảy và Chủ Nhật.",
      "Tối thiểu 3 vé trong cùng một giao dịch.",
    ],
  },
  {
    id: "promo_6",
    title: "Happy Hour F&B",
    description: "Giảm 25% toàn bộ đồ uống từ 14h–17h mỗi ngày.",
    category: "combo",
    discountLabel: "-25%",
    validUntil: "2026-12-31",
    imageUrl: "/images/popcorn.jpg",
    terms: [
      "Áp dụng tại quầy F&B, không áp dụng combo có sẵn.",
      "Không áp dụng ngày lễ.",
    ],
  },
];
