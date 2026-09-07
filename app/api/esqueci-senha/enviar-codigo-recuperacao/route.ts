import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { transportador } from "../../../lib/mailer";
// Cliente do Supabase com a chave de serviço, pra rodar no servidor sem restrição de RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
export async function POST(request: Request) {
  const { email, novaSenha } = await request.json();
  if (!email || !novaSenha) {
    return NextResponse.json({ erro: "Preencha e-mail e nova senha." }, { status: 400 });
  }
  // 1. Confere se o e-mail existe na tabela de Clientes
  const { data: cliente } = await supabaseAdmin
    .from("Clientes")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (!cliente) {
    return NextResponse.json({ erro: "Não existe conta cadastrada com esse e-mail." }, { status: 404 });
  }
  // 2. Gera um código de 6 dígitos
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();
  // 3. Salva o código e a senha nova (ainda não aplicada) na tabela de recuperação
  const { error: erroInsert } = await supabaseAdmin.from("RecuperacaoSenha").insert([
    {
      email,
      codigo,
      nova_senha: novaSenha,
    },
  ]);
  if (erroInsert) {
    console.error("Erro ao salvar código:", erroInsert.message);
    return NextResponse.json({ erro: "Erro ao gerar código. Tente novamente." }, { status: 500 });
  }
  // 4. Envia o e-mail com o código
  try {
    await transportador.sendMail({
      from: `Retrôa <${process.env.GMAIL_USER}>`,
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