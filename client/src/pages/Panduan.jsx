import React from "react";

function Panduan() {
  return (
    <div className="container fade-in" style={{ paddingTop: "30px", marginBottom: "50px" }}>
      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "8px", fontSize: "28px" }}>
        Tournament Guide & Rules
      </h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "30px", fontSize: "15px" }}>
        Learn about the new 48-team FIFA World Cup 2026 format, qualifications, points systems, and bracket rules.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        
        {/* Card 1: Format Turnamen */}
        <div className="glass" style={{ padding: "24px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card)" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", color: "var(--secondary)", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            🏆 Tournament Format
          </h3>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <li style={{ display: "flex", gap: "10px" }}>
              <span style={{ color: "var(--accent)" }}>🔹</span>
              <span><strong>Total Teams</strong>: 48 countries compete in the tournament.</span>
            </li>
            <li style={{ display: "flex", gap: "10px" }}>
              <span style={{ color: "var(--accent)" }}>🔹</span>
              <span><strong>Group Stage</strong>: 12 Groups (A to L), featuring 4 teams each.</span>
            </li>
            <li style={{ display: "flex", gap: "10px" }}>
              <span style={{ color: "var(--accent)" }}>🔹</span>
              <span><strong>Matches per Team</strong>: Every team plays 3 group matches (*Round Robin*).</span>
            </li>
            <li style={{ display: "flex", gap: "10px" }}>
              <span style={{ color: "var(--accent)" }}>🔹</span>
              <span><strong>Points System</strong>: Menang = 3 pts, Seri = 1 pt, Kalah = 0 pts.</span>
            </li>
            <li style={{ display: "flex", gap: "10px" }}>
              <span style={{ color: "var(--accent)" }}>🔹</span>
              <span><strong>Advance Rules</strong>: Top 2 teams from each group qualify automatically. The 8 best third-place teams across all groups join them.</span>
            </li>
            <li style={{ display: "flex", gap: "10px" }}>
              <span style={{ color: "var(--accent)" }}>🔹</span>
              <span><strong>Knockout Stage</strong>: Total of 32 advancing teams enter the direct knockout bracket (R32 ➔ R16 ➔ QF ➔ SF ➔ Final).</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Cara Membaca Head-to-Head */}
        <div className="glass" style={{ padding: "24px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card)" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", color: "var(--secondary)", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            📈 Head-to-Head Indicator Guide
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
            Below is the legend for reading matchups indicators in standings tables and results boards:
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px" }}>
            <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                width: "24px", height: "24px", borderRadius: "50%", border: "2px solid #E2E8F0",
                display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", background: "white", color: "black"
              }}>○</span>
              <span><strong>White Circle (Menang)</strong>: Indicates a victory.</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                width: "24px", height: "24px",
                display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", color: "var(--accent)"
              }}>△</span>
              <span><strong>Triangle (Seri)</strong>: Indicates a draw match.</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                width: "24px", height: "24px", borderRadius: "50%",
                display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", background: "black", color: "white"
              }}>●</span>
              <span><strong>Black Circle (Kalah)</strong>: Indicates a defeat.</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                width: "24px", height: "24px",
                display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px", color: "var(--text-muted)"
              }}>—</span>
              <span><strong>Dash (Tidak bermain)</strong>: Did not participate / unavailable.</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                width: "24px", height: "24px", border: "1px dashed var(--border)", borderRadius: "4px",
                display: "inline-flex"
              }}></span>
              <span><strong>Empty (Belum dimainkan)</strong>: Match is scheduled but not started.</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Ekosistem IT */}
        <div className="glass" style={{ padding: "24px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card)" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "20px", color: "var(--secondary)", marginBottom: "16px", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            💻 Peran Ekosistem IT
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}>
            Dalam pengembangan dan pemeliharaan simulator ini, berbagai role IT memastikan tidak ada eror, kode berjalan efisien, dan aplikasi berjalan dengan baik:
          </p>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <li style={{ display: "flex", gap: "10px" }}>
              <span style={{ color: "var(--accent)" }}>👨‍💻</span>
              <span><strong>Developer (Frontend/Backend)</strong>: Menulis kode yang efisien, memastikan logika turnamen berjalan sempurna tanpa bug.</span>
            </li>
            <li style={{ display: "flex", gap: "10px" }}>
              <span style={{ color: "var(--accent)" }}>🔍</span>
              <span><strong>Quality Assurance (QA)</strong>: Menguji setiap fitur, mencari celah eror, memastikan tidak ada eror.</span>
            </li>
            <li style={{ display: "flex", gap: "10px" }}>
              <span style={{ color: "var(--accent)" }}>⚙️</span>
              <span><strong>DevOps / SysAdmin</strong>: Mengatur deployment, dan memastikan aplikasi memiliki performa tinggi dan berjalan dengan baik.</span>
            </li>
            <li style={{ display: "flex", gap: "10px" }}>
              <span style={{ color: "var(--accent)" }}>🎨</span>
              <span><strong>UI/UX Designer</strong>: Merancang antarmuka yang intuitif dan memukau.</span>
            </li>
            <li style={{ display: "flex", gap: "10px" }}>
              <span style={{ color: "var(--accent)" }}>📊</span>
              <span><strong>System Analyst</strong>: Menganalisis kebutuhan sistem dan memastikan arsitektur sesuai kriteria.</span>
            </li>
            <li style={{ display: "flex", gap: "10px" }}>
              <span style={{ color: "var(--accent)" }}>📋</span>
              <span><strong>Project Manager</strong>: Mengoordinasikan seluruh tim agar bekerja sama secara efisien.</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default Panduan;
