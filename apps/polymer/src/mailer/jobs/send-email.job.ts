import { SendMailOptions } from "nodemailer";

export const SEND_EMAIL_JOB_NAME = "SEND_EMAIL";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SendEmailJob extends SendMailOptions {}
