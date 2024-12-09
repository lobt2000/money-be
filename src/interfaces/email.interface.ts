export interface IEmailTemplate {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
