// API QUE CONFIRMA O CODIGO ENVIADO POR E-MAIL E APLICA A NOVA SENHA.
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { email, codigo } = await request.json();
  if (!email || !codigo) {
    return NextResponse.json({ erro: "Informe o código recebido por e-mail." }, { status: 400 });
  }

  const quinzeMinutosAtras = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: registro, error: erroBusca } = await supabaseAdmin
    .from("RecuperacaoSenha")
    .select("*")
    .eq("email", email)
    .eq("codigo", codigo)
    .eq("usado", false)
    .gte("criado_em", quinzeMinutosAtras)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (erroBusca || !registro) {
    return NextResponse.json({ erro: "Código inválido ou expirado." }, { status: 400 });
  }

  const { error: erroUpdate } = await supabaseAdmin
    .from("Clientes")
    .update({ senha: registro.nova_senha })
    .eq("email", email);

  if (erroUpdate) {
    console.error("Erro ao atualizar senha:", erroUpdate.message);
    return NextResponse.json({ erro: "Erro ao atualizar a senha. Tente novamente." }, { status: 500 });
  }

  await supabaseAdmin.from("RecuperacaoSenha").update({ usado: true }).eq("id", registro.id);
  return NextResponse.json({ sucesso: true });
}