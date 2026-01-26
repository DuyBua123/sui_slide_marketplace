import { Link } from "react-router-dom";
import { ROUTE } from "../constant/routeConfig";

const licenseClauses = [
  {
    title: "Điều 1.1 – Phạm vi quyền",
    body: "Creator (A) giữ toàn bộ quyền sở hữu gốc đối với thiết kế. Người mua (B, C, D, …) chỉ được cấp quyền sử dụng không độc quyền, không chuyển nhượng, theo thời hạn đã chọn.",
  },
  {
    title: "Điều 1.2 – Thời hạn sử dụng",
    body: "Người mua lựa chọn một trong các thời hạn sau: n tháng, n năm hoặc vĩnh viễn. Thời hạn sử dụng được ghi nhận và quản lý trực tiếp bởi smart contract; khi hết hạn, quyền truy cập sẽ tự động chấm dứt.",
  },
  {
    title: "Điều 1.3 – Quyền chỉnh sửa và sử dụng",
    body: "Trong thời gian license còn hiệu lực, người mua có quyền chỉnh sửa, cá nhân hóa thiết kế và sử dụng cho mục đích cá nhân hoặc thương mại. Người mua không được bán lại template nguyên bản, chuyển nhượng quyền cho bên thứ ba, hoặc tuyên bố quyền sở hữu đối với thiết kế gốc.",
  },
  {
    title: "Điều 1.4 – Quyền cập nhật phiên bản",
    body: "Creator có quyền cập nhật hoặc phát hành phiên bản mới của thiết kế. Người mua được quyền tiếp tục dùng phiên bản cũ hoặc nâng cấp sang phiên bản mới, và quyền sử dụng không bị ảnh hưởng trong suốt thời hạn license.",
  },
  {
    title: "Điều 1.5 – Chuyển đổi sang quyền sở hữu",
    body: "Người mua có thể đề xuất mua lại quyền sở hữu trong thời gian license còn hiệu lực. Nếu Creator chấp thuận, khoản hoàn trả license được tính 70% giá trị nếu còn dưới 50% thời hạn, hoặc 30% sau 50% thời hạn. Việc chuyển đổi được thực hiện thông qua smart contract.",
  },
  {
    title: "Điều 1.6 – Chấm dứt quyền",
    body: "Khi license hết hạn hoặc bị hủy, mọi quyền sử dụng chấm dứt và quyền truy cập vào thiết kế bị thu hồi tự động; Creator không cần can thiệp thủ công.",
  },
];

const ownershipClauses = [
  {
    title: "Điều 2.1 – Chuyển nhượng quyền sở hữu",
    body: "Creator (A) chuyển nhượng toàn bộ quyền sở hữu thiết kế cho người mua (B) thông qua giao dịch on-chain. Việc chuyển nhượng vĩnh viễn và không thể đảo ngược.",
  },
  {
    title: "Điều 2.2 – Quyền của chủ sở hữu mới",
    body: "Chủ sở hữu mới có toàn quyền chỉnh sửa, khai thác, phân phối, bán lại hoặc cấp quyền sử dụng/bán quyền sở hữu cho bên thứ ba mà không cần sự đồng ý của Creator ban đầu.",
  },
  {
    title: "Điều 2.3 – Nghĩa vụ và hạn chế của Creator",
    body: "Sau khi chuyển nhượng, Creator không còn bất kỳ quyền nào với thiết kế, không được tiếp tục sử dụng, bán, cập nhật hoặc sao chép, và không được claim quyền tác giả hay quyền liên quan.",
  },
  {
    title: "Điều 2.4 – Bảo vệ quyền sở hữu",
    body: "Quyền sở hữu được ghi nhận trên blockchain, có thể kiểm chứng công khai, không phụ thuộc nền tảng trung gian và không thể bị thay đổi hoặc thu hồi trái phép.",
  },
  {
    title: "Điều 2.5 – Hiệu lực",
    body: "Quyền sở hữu có hiệu lực vĩnh viễn trừ khi chủ sở hữu mới tự nguyện chuyển nhượng cho bên khác thông qua smart contract.",
  },
];

export const Terms = () => {
  return (
    <div className="min-h-screen py-16 text-slate-700 dark:text-slate-200">
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-12">
        <section className="relative rounded-4xl overflow-hidden border border-white/20 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white p-10 shadow-2xl">
          <div
            className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),_transparent_40%)]"
            aria-hidden="true"
          ></div>
          <div className="relative space-y-6">
            <p className="text-xs tracking-[0.35em] uppercase font-semibold text-white/70">
              Trust & Transparency
            </p>
            <h1 className="text-4xl md:text-5xl font-black leading-tight">
              Điều khoản &amp; Dịch vụ
            </h1>
            <p className="text-base md:text-lg text-white/90 max-w-3xl">
              Đây là phiên bản đầy đủ của điều khoản license và quyền sở hữu đối với mỗi
              template được niêm yết trên Slide Marketplace. Vui lòng đọc kỹ trước khi tiếp tục
              giao dịch.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link
                to={ROUTE.MARKET}
                className="px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur text-white hover:bg-white/20 transition"
              >
                ← Quay lại Marketplace
              </Link>
              <a
                href="#license"
                className="px-5 py-2.5 rounded-2xl bg-white text-blue-700 hover:text-blue-900"
              >
                Điều khoản License
              </a>
              <a
                href="#ownership"
                className="px-5 py-2.5 rounded-2xl bg-cyan-900/50 border border-white/40"
              >
                Điều khoản Ownership
              </a>
            </div>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <article
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 shadow-lg"
            id="license"
          >
            <div className="flex items-center gap-3 text-rose-500 font-semibold uppercase text-xs tracking-[0.3em]">
              <span role="img" aria-label="License">
                🔴
              </span>
              Điều khoản 1
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">
              Quyền sử dụng (License)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              License là quyền sử dụng có thời hạn, không độc quyền. Tất cả điều khoản dưới đây
              được thi hành tự động bởi smart contract.
            </p>
            <div className="mt-6 space-y-6">
              {licenseClauses.map((clause) => (
                <div
                  key={clause.title}
                  className="rounded-2xl border border-slate-100 dark:border-white/10 p-5"
                >
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {clause.title}
                  </p>
                  <p className="text-sm mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                    {clause.body}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 shadow-lg"
            id="ownership"
          >
            <div className="flex items-center gap-3 text-blue-500 font-semibold uppercase text-xs tracking-[0.3em]">
              <span role="img" aria-label="Ownership">
                🔵
              </span>
              Điều khoản 2
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">
              Quyền sở hữu (Ownership)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Ownership là quyền sở hữu vĩnh viễn đối với toàn bộ nội dung template. Một khi
              hoàn tất giao dịch, Creator không còn quyền can thiệp.
            </p>
            <div className="mt-6 space-y-6">
              {ownershipClauses.map((clause) => (
                <div
                  key={clause.title}
                  className="rounded-2xl border border-slate-100 dark:border-white/10 p-5"
                >
                  <p className="text-base font-semibold text-slate-900 dark:text-white">
                    {clause.title}
                  </p>
                  <p className="text-sm mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
                    {clause.body}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 shadow-xl">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Cam kết minh bạch
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Tất cả giao dịch được ghi nhận on-chain giúp đảm bảo tính minh bạch, dễ dàng truy
            xuất và không thể làm giả. Nếu bạn có câu hỏi về điều khoản hoặc muốn báo cáo vi
            phạm, vui lòng gửi email đến{" "}
            <a href="mailto:legal@slide.market" className="text-blue-500 font-semibold">
              legal@slide.market
            </a>
            .
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 text-sm">
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-5 border border-slate-100 dark:border-white/10">
              <p className="font-semibold text-slate-900 dark:text-white">Cập nhật gần nhất</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Ngày 26 tháng 01 năm 2026
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-5 border border-slate-100 dark:border-white/10">
              <p className="font-semibold text-slate-900 dark:text-white">Liên hệ hỗ trợ</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Telegram @SlideMarketplace hoặc email team@sui-slide.app
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 text-sm font-semibold justify-end">
          <Link
            to={ROUTE.MARKET}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700"
          >
            Quay lại mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
};
