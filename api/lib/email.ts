import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@toroscope.com";
const APP_URL = process.env.APP_URL || "";

let resend: Resend | null = null;

function getResend() {
  if (!resend && RESEND_API_KEY) {
    resend = new Resend(RESEND_API_KEY);
  }
  return resend;
}

export async function sendPasswordResetEmail(
  to: string,
  resetToken: string,
): Promise<{ success: boolean; message: string }> {
  const client = getResend();
  if (!client) {
    return {
      success: false,
      message: "邮件服务未配置",
    };
  }

  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "【戛纳主竞赛股市】密码重置",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #e8e8e8; background: #1a1816;">
          <h2 style="color: #c9a84c; margin-bottom: 16px;">密码重置</h2>
          <p>您好，</p>
          <p>您 requested a password reset for your account at 戛纳主竞赛股市.</p>
          <p>点击下方链接重置密码（24小时内有效）：</p>
          <a href="${resetUrl}" style="display: inline-block; background: #c9a84c; color: #141210; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 16px 0;">
            重置密码
          </a>
          <p style="color: #888; font-size: 12px; margin-top: 24px;">
            如果这不是您的操作，请忽略此邮件。链接将在24小时后过期。
          </p>
          <p style="color: #888; font-size: 12px;">
            陀螺电影 Toroscope
          </p>
        </div>
      `,
      text: `密码重置

请点击以下链接重置您的密码（24小时内有效）：
${resetUrl}

如果这不是您的操作，请忽略此邮件。
陀螺电影 Toroscope
`,
    });

    return { success: true, message: "重置邮件已发送" };
  } catch (err: any) {
    console.error("Email send failed:", err);
    return { success: false, message: `邮件发送失败: ${err.message}` };
  }
}
