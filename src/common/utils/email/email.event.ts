import { EventEmitter } from 'node:events';
import Mail from 'nodemailer/lib/mailer';
import { sendEmail } from '../email/send.email';
import { verifyEmail } from '../email/verify.template.email';
import { OtpEnum } from 'src/common/enums';

export interface IEmail extends Mail.Options {
  otp: string;
}

export const emailEvent = new EventEmitter();

emailEvent.on(OtpEnum.ConfirmEmail, async (data: IEmail) => {
  try {
    data.subject = OtpEnum.ConfirmEmail;
    data.html = verifyEmail({ otp: data.otp, title: data.subject });
    await sendEmail(data);
  } catch (error) {
    console.log(`Fail to send email`, error);
  }
});

emailEvent.on(OtpEnum.ResetPassword, async (data: IEmail) => {
  try {
    data.subject = OtpEnum.ResetPassword;
    data.html = verifyEmail({ otp: data.otp, title: data.subject });
    await sendEmail(data);
  } catch (error) {
    console.log(`Fail to send email`, error);
  }
});

emailEvent.on('TagNotification', async (data) => {
  try {
    await sendEmail(data);
    console.log('Tag email sent to:', data.to);
  } catch (error) {
    console.error('Failed to send tag email:', error);
  }
});
