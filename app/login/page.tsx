"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const erroUrl = searchParams.get("erro");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (erroUrl === "oauth_falhou") {
      router.push("/login/erro");
    }
  }, [erroUrl, router]);

  const processarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    // 1. Tenta autenticar como Cliente
    const { data: dataCliente } = await supabase.rpc("verificar_login", {
      email_input: email,
      senha_input: senha,
    });

    if (dataCliente && dataCliente.length > 0) {
      const cliente = dataCliente[0];
      const { senha: _senhaOmitida, ...clienteSemSenha } = cliente;
      localStorage.setItem("retroa_sessao", JSON.stringify(clienteSemSenha));
      alert("Login realizado com sucesso!");
      window.location.href = "/carrinho";
      return;
    }

    // 2. Se não bateu como cliente, tenta como Administrador
    const { data: dataAdmin } = await supabase.rpc("verificar_login_admin", {
      email_input: email,
      senha_input: senha,
    });

    if (dataAdmin && dataAdmin.length > 0) {
      localStorage.setItem("retroa_admin_sessao", "true");
      window.location.href = "/adm";
      return;
    }

    // 3. Verifica se o e-mail sequer existe no banco para orientar o cadastro
    const { data: clienteExistente } = await supabase
      .from("Clientes")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    setCarregando(false);

    if (!clienteExistente) {
      alert("Conta não encontrada. Se você ainda não possui um cadastro, crie sua conta primeiro.");
    } else {
      alert("E-mail ou senha incorretos.");
    }
  };

  const fazerLoginComGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?acao=login`,
      },
    });

    if (error) {
      alert("Erro ao conectar com o Google: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#2C221E] font-sans antialiased flex flex-col justify-between">
      <nav className="border-b border-[#2C221E]/10 bg-[#F4EFE6]/95">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logotransp.png"
              alt="Logo Retrôa"
              height={50}
              width={50}
              className="object-contain h-auto w-auto"
              priority
            />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5F4E44] hover:text-[#2C221E]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-md mx-auto px-6 py-12 w-full flex-grow flex flex-col justify-center">
        <div className="bg-[#EAE3D2]/40 p-8 rounded-lg border border-[#2C221E]/10 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#C85A32]">
              Área do Cliente
            </span>
            <h1 className="font-vintage text-2xl font-medium text-[#2C221E]">
              Acessar sua conta
            </h1>
          </div>

          {/* ALERTA DE ERRO REDIRECIONADO DO CALLBACK DO GOOGLE */}
          {erroUrl === "conta_nao_encontrada" && (
            <div className="p-3 bg-red-100/80 border border-red-300 text-red-800 rounded flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                Sua conta Google ainda não está cadastrada. Faça seu cadastro para acessar.
              </span>
            </div>
          )}

          <form onSubmit={processarLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#5F4E44] block mb-1">
                E-mail
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                />
                <Mail className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-[#5F4E44]">
                  Senha
                </label>
                <Link
                  href="/esqueci-senha"
                  className="text-[11px] text-[#C85A32] hover:underline font-medium"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                />
                <Lock className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#2C221E] text-[#F4EFE6] text-xs font-semibold uppercase tracking-wider py-3 rounded hover:bg-[#C85A32] transition-colors cursor-pointer disabled:opacity-50"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#2C221E]/10"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase text-[#5F4E44] font-semibold">
              ou
            </span>
            <div className="flex-grow border-t border-[#2C221E]/10"></div>
          </div>

          <button
            type="button"
            onClick={fazerLoginComGoogle}
            className="w-full bg-[#EADFD0] text-[#2C221E] border border-[#2C221E]/20 text-xs font-semibold uppercase tracking-wider py-3 rounded hover:bg-[#EAE3D2] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Entrar com Google
          </button>

          <div className="text-center pt-2 border-t border-[#2C221E]/10">
            <Link
              href="/cadastro"
              className="text-xs text-[#C85A32] hover:underline"
            >
              Ainda não tem conta? Cadastre-se
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#2C221E]/10 bg-[#EAE3D2]/40 py-6 text-center text-xs text-[#5F4E44]">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
          <span>Acesso seguro integrado ao banco de dados.</span>
        </div>
      </footer>
    </div>
  );
}