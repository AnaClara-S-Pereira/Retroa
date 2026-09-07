"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, User, Mail, Lock, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function CadastroPage() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);

    const processarCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        setCarregando(true);

        const { data, error } = await supabase
            .from("Clientes")
            .insert([
                {
                    nome,
                    email,
                    senha,
                }
            ])
            .select();

        if (error) {
            console.error("Erro ao cadastrar:", error.message);
            alert("Erro ao criar conta. Verifique os dados ou se o e-mail já existe.");
            setCarregando(false);
            return;
        }

        const clienteCriado = data ? data[0] : { nome, email };
        const { senha: _senhaOmitida, ...clienteSemSenha } = clienteCriado;
        localStorage.setItem("retroa_sessao", JSON.stringify(clienteSemSenha));

        alert("Conta criada com sucesso!");
        window.location.href = "/carrinho";
    };

    const cadastrarComGoogle = async () => {
        setCarregando(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback?acao=cadastro`,
            },
        });

        if (error) {
            console.error("Erro no cadastro com Google:", error.message);
            alert("Erro ao conectar com a conta do Google.");
            setCarregando(false);
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
                    <Link href="/" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5F4E44] hover:text-[#2C221E]">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar ao Início</span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-md mx-auto px-6 py-12 w-full flex-grow flex flex-col justify-center">
                <div className="bg-[#EAE3D2]/40 p-8 rounded-lg border border-[#2C221E]/10 space-y-6">
                    <div className="text-center space-y-1">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#C85A32]">
                            Novo Cliente
                        </span>
                        <h1 className="font-vintage text-2xl font-medium text-[#2C221E]">
                            Criar nova conta
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={cadastrarComGoogle}
                        disabled={carregando}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-[#2C221E]/20 text-[#2C221E] text-xs font-semibold py-2.5 rounded hover:bg-stone-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Cadastrar com Google</span>
                    </button>

                    <div className="relative flex items-center justify-center">
                        <div className="border-t border-[#2C221E]/10 w-full"></div>
                        <span className="bg-[#F4EFE6] px-3 text-[10px] uppercase font-bold text-[#5F4E44] absolute">
                            Ou com e-mail
                        </span>
                    </div>

                    <form onSubmit={processarCadastro} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Nome Completo</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                                />
                                <User className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#5F4E44] block mb-1">E-mail</label>
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
                            <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Senha</label>
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
                            className="w-full bg-[#C85A32] text-white text-xs font-semibold uppercase tracking-wider py-3 rounded hover:bg-[#B04C27] transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {carregando ? "Cadastrando..." : "Cadastrar"}
                        </button>
                    </form>

                    <div className="text-center pt-2 border-t border-[#2C221E]/10">
                        <Link href="/login" className="text-xs text-[#C85A32] hover:underline">
                            Já tem uma conta? Faça login
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="border-t border-[#2C221E]/10 bg-[#EAE3D2]/40 py-6 text-center text-xs text-[#5F4E44]">
                <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                    <span>Dados protegidos e integrados ao banco de dados.</span>
                </div>
            </footer>
        </div>
    );
}