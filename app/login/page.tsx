"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);

    const processarLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setCarregando(true);

        // BUSCA A PESSOA PELO EMAIL E SENHA NO SUPABASE
        const { data, error } = await supabase
            .from("Clientes")
            .select("*")
            .eq("email", email)
            .eq("senha", senha)
            .single();

        if (error || !data) {
            console.error("Erro no login:", error?.message);
            alert("E-mail ou senha incorretos.");
            setCarregando(false);
            return;
        }

        // SALVA A SESSÃO DO USUÁRIO ENCONTRADO NO NAVEGADOR
        localStorage.setItem("retroa_sessao", JSON.stringify(data));

        alert("Login realizado com sucesso!");
        window.location.href = "/carrinho";
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
                            Área do Cliente
                        </span>
                        <h1 className="font-vintage text-2xl font-medium text-[#2C221E]">
                            Acessar sua conta
                        </h1>
                    </div>

                    <form onSubmit={processarLogin} className="space-y-4">
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
                            className="w-full bg-[#2C221E] text-[#F4EFE6] text-xs font-semibold uppercase tracking-wider py-3 rounded hover:bg-[#C85A32] transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {carregando ? "Entrando..." : "Entrar"}
                        </button>
                    </form>

                    <div className="text-center pt-2 border-t border-[#2C221E]/10">
                        <Link href="/cadastro" className="text-xs text-[#C85A32] hover:underline">
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