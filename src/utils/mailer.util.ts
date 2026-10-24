import nodemailer from "nodemailer";
import { env } from "../configs/env.config";

export class MailerUtil {
  private static transporter = nodemailer.createTransport({
    host: env.SMTP_HOST || "localhost",
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          }
        : undefined,
  });

  static async sendInvitationEmail(toEmail: string, token: string): Promise<void> {
    const activationLink = `${env.FRONTEND_URL}/activate?token=${token}`;

    const mailOptions = {
      from: env.SMTP_FROM,
      to: toEmail,
      subject: "Undangan Bergabung & Aktivasi Akun Tim",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #2b6cb0;">Undangan Bergabung ke Aplikasi Manajemen Laporan</h2>
          <p>Halo,</p>
          <p>Ketua Tim Anda telah mengundang Anda untuk bergabung ke dalam sistem manajemen laporan keuangan pengeluaran.</p>
          <p>Silakan klik tautan di bawah ini untuk mengaktivasi akun dan membuat kata sandi Anda:</p>
          <div style="margin: 25px 0;">
            <a href="${activationLink}" style="background-color: #3182ce; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Aktivasi Akun & Buat Password
            </a>
          </div>
          <p style="color: #e53e3e; font-size: 14px;"><strong>PENTING:</strong> Tautan ini hanya berlaku selama <strong>24 jam</strong> sejak email ini dikirim.</p>
          <p style="color: #718096; font-size: 13px;">Jika tombol di atas tidak dapat diklik, salin tautan berikut ke browser Anda:<br/>${activationLink}</p>
        </div>
      `,
    };

    // Jika SMTP belum terkonfigurasi secara aktif, log link ke konsol agar pengembang tetap bisa menguji flow aktivasi
    if (!env.SMTP_USER || !env.SMTP_HOST) {
      console.log("-----------------------------------------------------------------");
      console.log(`[MAILER SIMULATION] Email undangan dikirim ke: ${toEmail}`);
      console.log(`[MAILER SIMULATION] Token: ${token}`);
      console.log(`[MAILER SIMULATION] Link Aktivasi: ${activationLink}`);
      console.log("-----------------------------------------------------------------");
      return;
    }

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("[MAILER ERROR] Gagal mengirim email:", error);
      console.log(`[MAILER FALLBACK] Link Aktivasi: ${activationLink}`);
    }
  }
}

