// CONFIGURACAO DO ENVIO DE E-MAIL (GMAIL).
import nodemailer from "nodemailer";

export const transportador = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
