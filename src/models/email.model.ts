import { IEmailTemplate } from "../interfaces/email.interface";

export class EmailTemplate implements IEmailTemplate {
  from: string = "Destini Goodwin <destini46@ethereal.email>";
  to: string = "bkolodiy20013@gmail.com";
  subject: string;
  text?: string;
  html?: string;

  constructor(email: string, subject: string, text: string, html: string) {
    this.to = email;
    this.subject = subject;
    this.text = text;
    this.html = html;
  }
}
