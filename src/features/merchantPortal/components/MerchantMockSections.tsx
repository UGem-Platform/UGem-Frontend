export function MerchantMockSections() {
  return (
    <section className="merchant-mock-grid">
      <article className="merchant-mock-card">
        <h3>Nhà hàng của bạn</h3>
        <p>
          Backend chưa có API <code>GET /api/Merchant/me</code>, nên phần này
          đang để UI trước.
        </p>

        <div className="mock-empty">Chưa có dữ liệu nhà hàng</div>
      </article>

      <article className="merchant-mock-card">
        <h3>Campaign</h3>
        <p>
          Tính năng campaign chưa có API. Có thể làm UI trước để sau này connect
          backend.
        </p>

        <div className="mock-empty">Sắp ra mắt</div>
      </article>

      <article className="merchant-mock-card">
        <h3>Thống kê lượt xem</h3>
        <p>Backend chưa có API thống kê view/impression. Hiện dùng mock UI.</p>

        <div className="mock-bars">
          <span />
          <span />
          <span />
          <span />
        </div>
      </article>
    </section>
  );
}
