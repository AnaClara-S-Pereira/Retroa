// app/api/esqueci-senha/enviar-codigo-recuperacao/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { transportador } from "../../../lib/mailer";

export async function POST(request: Request) {
  // Inicializamos o Supabase aqui dentro da função
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { email, novaSenha } = await request.json();
  if (!email || !novaSenha) {
    return NextResponse.json({ erro: "E-mail e nova senha são obrigatórios." }, { status: 400 });
  }

  const { data: cliente } = await supabaseAdmin
    .from("Clientes")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (!cliente) {
    return NextResponse.json({ erro: "Não existe conta cadastrada com esse e-mail." }, { status: 404 });
  }

  const codigo = Math.floor(100000 + Math.random() * 900000).toString();

  const { error: erroInsert } = await supabaseAdmin.from("RecuperacaoSenha").insert([
    { email, codigo, nova_senha: novaSenha },
  ]);
  if (erroInsert) {
    console.error("Erro ao salvar código:", erroInsert.message);
    return NextResponse.json({ erro: "Erro ao gerar código. Tente novamente." }, { status: 500 });
  }

  try {
    await transportador.sendMail({
      from: `Retrôa <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Código de recuperação de senha — Retrôa",
      html: `
        <div style="font-family: sans-serif; padding: 24px; color: #2C221E;">
          <h2>Recuperação de senha</h2>
          <p>Use o código abaixo para confirmar a troca da sua senha na Retrôa:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${codigo}</p>
          <p style="font-size: 12px; color: #5F4E44;">Esse código expira em 15 minutos. Se você não pediu essa troca, pode ignorar este e-mail.</p>
        </div>
      `,
    });
  } catch (erroEmail) {
    console.error("Erro ao enviar e-mail:", erroEmail);
    return NextResponse.json({ erro: "Erro ao enviar o e-mail. Tente novamente." }, { status: 500 });
  }

  return NextResponse.json({ sucesso: true });
}