import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const acao = searchParams.get("acao");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user?.email) {
      const userEmail = session.user.email;
      const userName =
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        "Cliente Google";

      // 1. Busca se já existe no banco
      let { data: cliente } = await supabase
        .from("Clientes")
        .select("*")
        .eq("email", userEmail)
        .maybeSingle();

      // 2. Se a intenção foi "login" e a conta não existe, bloqueia
      if (!cliente && acao === "login") {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login/erro`);
      }

      // 3. Se não existe e veio pelo Cadastro, cria a conta na tabela Clientes
      if (!cliente) {
        const { data: novoCliente, error: erroCadastro } = await supabase
          .from("Clientes")
          .insert([
            {
              nome: userName,
              email: userEmail,
            },
          ])
          .select()
          .maybeSingle();

        if (erroCadastro) {
          console.error("Erro ao criar cliente:", erroCadastro);
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/login/erro`);
        }

        cliente = novoCliente;
      }

      // 4. Redireciona para o perfil passando os dados para a página salvar no localStorage
      const clienteData = encodeURIComponent(
        JSON.stringify({
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email,
        })
      );

      return NextResponse.redirect(`${origin}/perfil?sessao=${clienteData}`);
    }
  }

  return NextResponse.redirect(`${origin}/login/erro`);
}