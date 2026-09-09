import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  // Inicializamos o Supabase aqui dentro, garantindo que ele só roda quando a API for chamada
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { email, codigo } = await request.json();
  if (!email || !codigo) {
    return NextResponse.json({ erro: "Informe o código recebido por e-mail." }, { status: 400 });
  }

  // 1. Procura um código válido: mesmo e-mail, mesmo código, não usado, gerado há menos de 15 minutos
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

  // 2. Aplica a nova senha no cliente (o trigger do banco já criptografa automaticamente)
  const { error: erroUpdate } = await supabaseAdmin
    .from("Clientes")
    .update({ senha: registro.nova_senha })
    .eq("email", email);

  if (erroUpdate) {
    console.error("Erro ao atualizar senha:", erroUpdate.message);
    return NextResponse.json({ erro: "Erro ao atualizar a senha. Tente novamente." }, { status: 500 });
  }

  // 3. Marca o código como usado, pra não poder ser reaproveitado
  await supabaseAdmin.from("RecuperacaoSenha").update({ usado: true }).eq("id", registro.id);
  return NextResponse.json({ sucesso: true });
}