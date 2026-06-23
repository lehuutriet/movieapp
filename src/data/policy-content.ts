export type PolicySlug = "terms" | "privacy" | "data-safety";

export interface PolicySection {
  title: string;
  paragraphs: string[];
}

export interface PolicyDocument {
  slug: PolicySlug;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: PolicySection[];
}

export const POLICY_DOCUMENTS: Record<PolicySlug, PolicyDocument> = {
  terms: {
    slug: "terms",
    title: "Điều khoản & Điều kiện",
    subtitle: "Quy định sử dụng dịch vụ đặt vé Cine Hall",
    lastUpdated: "01/06/2026",
    sections: [
      {
        title: "1. Chấp nhận điều khoản",
        paragraphs: [
          "Khi truy cập website hoặc ứng dụng Cine Hall và thực hiện đặt vé, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này.",
          "Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.",
        ],
      },
      {
        title: "2. Đặt vé và thanh toán",
        paragraphs: [
          "Giá vé và phí dịch vụ được hiển thị tại thời điểm đặt. Giao dịch chỉ được xác nhận sau khi thanh toán thành công.",
          "Vé đã thanh toán không hoàn tiền, trừ khi suất chiếu bị hủy bởi rạp hoặc theo quy định pháp luật.",
          "Bạn chịu trách nhiệm kiểm tra thông tin suất chiếu, rạp, ghế ngồi trước khi xác nhận thanh toán.",
        ],
      },
      {
        title: "3. Vé điện tử",
        paragraphs: [
          "Vé điện tử được gửi qua tài khoản hoặc hiển thị bằng mã QR. Mỗi mã QR chỉ sử dụng một lần tại cửa soát vé.",
          "Không chia sẻ mã vé công khai để tránh bị sử dụng trái phép.",
        ],
      },
      {
        title: "4. Hành vi bị cấm",
        paragraphs: [
          "Nghiêm cấm sử dụng bot, công cụ tự động hoặc thao tác gian lận để giữ ghế hoặc mua vé số lượng lớn.",
          "Cine Hall có quyền hủy giao dịch và khóa tài khoản nếu phát hiện hành vi vi phạm.",
        ],
      },
      {
        title: "5. Thay đổi điều khoản",
        paragraphs: [
          "Cine Hall có thể cập nhật điều khoản theo thời gian. Phiên bản mới có hiệu lực khi được đăng trên website.",
        ],
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Chính sách bảo mật",
    subtitle: "Cách chúng tôi thu thập và sử dụng thông tin cá nhân",
    lastUpdated: "01/06/2026",
    sections: [
      {
        title: "1. Thông tin thu thập",
        paragraphs: [
          "Chúng tôi thu thập thông tin bạn cung cấp khi đăng ký (họ tên, email), lịch sử đặt vé, và dữ liệu kỹ thuật như địa chỉ IP, loại trình duyệt.",
          "Khi đăng nhập bằng Google, chúng tôi nhận thông tin cơ bản từ tài khoản Google theo phạm vi bạn cho phép.",
        ],
      },
      {
        title: "2. Mục đích sử dụng",
        paragraphs: [
          "Xử lý đặt vé, gửi vé điện tử, hỗ trợ khách hàng và cải thiện trải nghiệm sử dụng.",
          "Gửi thông báo về suất chiếu, ưu đãi nếu bạn đồng ý nhận tin.",
        ],
      },
      {
        title: "3. Chia sẻ thông tin",
        paragraphs: [
          "Chúng tôi không bán dữ liệu cá nhân. Thông tin chỉ được chia sẻ với đối tác thanh toán, nhà cung cấp hạ tầng (Appwrite) khi cần thiết để vận hành dịch vụ.",
        ],
      },
      {
        title: "4. Quyền của bạn",
        paragraphs: [
          "Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân bằng cách liên hệ info@cinehall.com.",
          "Bạn có thể rút lại sự đồng ý nhận email marketing bất cứ lúc nào.",
        ],
      },
      {
        title: "5. Liên hệ",
        paragraphs: [
          "Mọi thắc mắc về bảo mật, vui lòng gửi email tới info@cinehall.com.",
        ],
      },
    ],
  },
  "data-safety": {
    slug: "data-safety",
    title: "An toàn dữ liệu",
    subtitle: "Biện pháp bảo vệ dữ liệu và giao dịch của bạn",
    lastUpdated: "01/06/2026",
    sections: [
      {
        title: "1. Mã hóa và truyền tải",
        paragraphs: [
          "Toàn bộ kết nối giữa trình duyệt và máy chủ sử dụng HTTPS để mã hóa dữ liệu trên đường truyền.",
          "Mật khẩu được lưu trữ dưới dạng băm bởi nhà cung cấp xác thực (Appwrite), không lưu plain-text.",
        ],
      },
      {
        title: "2. Phiên đăng nhập",
        paragraphs: [
          "Phiên đăng nhập được quản lý bằng cookie/session bảo mật. Bạn nên đăng xuất khi dùng máy tính công cộng.",
          "Chúng tôi khuyến nghị sử dụng mật khẩu mạnh và không chia sẻ tài khoản.",
        ],
      },
      {
        title: "3. Thanh toán",
        paragraphs: [
          "Thông tin thẻ thanh toán được xử lý bởi cổng thanh toán đối tác, Cine Hall không lưu số thẻ đầy đủ trên hệ thống.",
        ],
      },
      {
        title: "4. Sao lưu và phục hồi",
        paragraphs: [
          "Dữ liệu đặt vé được sao lưu định kỳ trên hạ tầng đám mây để đảm bảo khả năng phục hồi khi sự cố.",
        ],
      },
      {
        title: "5. Báo cáo sự cố",
        paragraphs: [
          "Nếu phát hiện truy cập trái phép hoặc lỗ hổng bảo mật, vui lòng báo ngay qua info@cinehall.com để chúng tôi xử lý kịp thời.",
        ],
      },
    ],
  },
};

export function isPolicySlug(value: string): value is PolicySlug {
  return value === "terms" || value === "privacy" || value === "data-safety";
}
