// src/components/LicenseExpired.jsx
import { useState } from "react";

export default function LicenseExpired() {
    const [lang, setLang] = useState("en"); // "en" أو "ar"

    const isArabic = lang === "ar";

    const containerStyle = {
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #7b0000, #2b0000)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        direction: isArabic ? "rtl" : "ltr",
        fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    };

    const cardStyle = {
        background: "rgba(255, 255, 255, 0.08)",
        borderRadius: "24px",
        padding: "32px 28px",
        width: "100%",
        maxWidth: "520px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        color: "#fff",
        textAlign: "center",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.18)",
    };

    const title = isArabic ? "انتهاء صلاحية ترخيص النظام" : "System License Expired";

    const paragraph = isArabic
        ? "لا يمكن متابعة استخدام البوابة الإلكترونية لشركة بركة المدينة، لأن ترخيص التشغيل الحالي غير صالح أو منتهي. يرجى تجديد الترخيص لمواصلة استخدام النماذج والاعتمادات والتواصل الداخلي."
        : "You can no longer use the Berkat Madinah Internal Portal because the current runtime license is invalid or expired. Please renew your license to continue using all forms, approvals, and internal communication features.";

    const statusLabel = isArabic ? "حالة النظام:" : "System status:";
    const statusValue = isArabic
        ? "متوقف بسبب انتهاء الترخيص"
        : "Stopped due to license expiration";

    const infoLine = isArabic
        ? "لمتابعة العمل، يرجى إرسال طلب تجديد إلى إدارة تقنية المعلومات أو الدعم الفني."
        : "To continue using the portal, please contact your IT department or the support team to renew the license.";

    const supportText = isArabic
        ? "تواصل مع الدعم لتجديد الترخيص"
        : "Contact support to renew the license";

    const hintText = isArabic
        ? "في حال تم رفع ملف ترخيص جديد على الخادم، يرجى إعادة فتح النظام أو تحديث الصفحة."
        : "If a new license file has been uploaded to the server, please reload the system or refresh this page.";

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {/* شارة التحذير */}
                <div
                    style={{
                        width: 70,
                        height: 70,
                        borderRadius: "50%",
                        margin: "0 auto 18px",
                        background: "rgba(255, 255, 255, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "34px",
                    }}
                >
                    ❗
                </div>

                {/* سويتش اللغة */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: isArabic ? "flex-start" : "flex-end",
                        marginBottom: 16,
                    }}
                >
                    <div
                        style={{
                            background: "rgba(0,0,0,0.35)",
                            borderRadius: 999,
                            padding: 4,
                            display: "inline-flex",
                            gap: 4,
                        }}
                    >
                        <button
                            onClick={() => setLang("en")}
                            style={{
                                border: "none",
                                borderRadius: 999,
                                padding: "4px 12px",
                                cursor: "pointer",
                                fontSize: 12,
                                background: !isArabic ? "#ffffff" : "transparent",
                                color: !isArabic ? "#7b0000" : "#ffffff",
                                fontWeight: !isArabic ? 700 : 400,
                            }}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setLang("ar")}
                            style={{
                                border: "none",
                                borderRadius: 999,
                                padding: "4px 12px",
                                cursor: "pointer",
                                fontSize: 12,
                                background: isArabic ? "#ffffff" : "transparent",
                                color: isArabic ? "#7b0000" : "#ffffff",
                                fontWeight: isArabic ? 700 : 400,
                            }}
                        >
                            عربي
                        </button>
                    </div>
                </div>

                {/* العنوان */}
                <h1
                    style={{
                        fontSize: "24px",
                        marginBottom: "16px",
                        fontWeight: "800",
                        letterSpacing: "0.03em",
                    }}
                >
                    {title}
                </h1>

                {/* النص الرئيسي */}
                <p
                    style={{
                        fontSize: "16px",
                        lineHeight: 1.8,
                        marginBottom: "22px",
                        color: "rgba(255,255,255,0.9)",
                        textAlign: isArabic ? "right" : "left",
                    }}
                >
                    {paragraph}
                </p>

                {/* حالة النظام */}
                <div
                    style={{
                        background: "rgba(0,0,0,0.25)",
                        borderRadius: "14px",
                        padding: "14px 16px",
                        fontSize: "14px",
                        marginBottom: "24px",
                        textAlign: isArabic ? "right" : "left",
                    }}
                >
                    <div style={{ marginBottom: 6 }}>
                        <span style={{ opacity: 0.8 }}>{statusLabel}</span>{" "}
                        <strong style={{ color: "#ffdddd" }}>{statusValue}</strong>
                    </div>
                    <div style={{ opacity: 0.9 }}>{infoLine}</div>
                </div>

                {/* أزرار / توجيه */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <span
                        style={{
                            display: "inline-block",
                            background: "#ff4444",
                            padding: "12px 24px",
                            borderRadius: "999px",
                            color: "#fff",
                            fontSize: "16px",
                            fontWeight: 700,
                            textDecoration: "none",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                        }}
                    >
                        {supportText}
                    </span>

                    <span
                        style={{
                            fontSize: "13px",
                            opacity: 0.9,
                            textAlign: isArabic ? "right" : "left",
                        }}
                    >
                        {hintText}
                    </span>
                </div>
            </div>
        </div>
    );
}
