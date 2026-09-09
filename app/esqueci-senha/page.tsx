// app/esqueci-senha/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, KeyRound, ShieldCheck } from "lucide-react";

export default function EsqueciSenhaPage() {
    const [etapa, setEtapa] = useState<"solicitar" | "codigo">("solicitar");

    const [email, setEmail] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [codigo, setCodigo] = useState("");

    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");

    const solicitarCodigo = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");

        if (novaSenha !== confirmarSenha) {
            setErro("As senhas não coincidem.");
            return;
        }

        setCarregando(true);

        try {
            const res = await fetch("/api/esqueci-senha/enviar-codigo-recuperacao", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, novaSenha }),
            });

            let resultado: any = {};
            try {
                resultado = await res.json();
            } catch {
                throw new Error("Resposta inválida do servidor.");
            }

            if (!res.ok) {
                setErro(resultado.erro || "Erro ao enviar o código.");
                return;
            }

            setEtapa("codigo");
        } catch (err) {
            console.error(err);
            setErro("Erro ao enviar o código. Tente novamente em instantes.");
        } finally {
            setCarregando(false);
        }
    };

    const confirmarCodigo = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");
        setCarregando(true);

        try {
            const res = await fetch("/api/esqueci-senha/confirmar-codigo-recuperacao", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, codigo }),
            });

            let resultado: any = {};
            try {
                resultado = await res.json();
            } catch {
                throw new Error("Resposta inválida do servidor.");
            }

            if (!res.ok) {
                setErro(resultado.erro || "Código inválido.");
                return;
            }

            alert("Senha redefinida com sucesso! Faça login com a nova senha.");
            window.location.href = "/login";
        } catch (err) {
            console.error(err);
            setErro("Erro ao confirmar o código. Tente novamente.");
        } finally {
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
                    <Link href="/login" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5F4E44] hover:text-[#2C221E]">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar ao Login</span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-md mx-auto px-6 py-12 w-full flex-grow flex flex-col justify-center">
                <div className="bg-[#EAE3D2]/40 p-8 rounded-lg border border-[#2C221E]/10 space-y-6">
                    <div className="text-center space-y-1">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#C85A32]">
                            Recuperação de Senha
                        </span>
                        <h1 className="font-vintage text-2xl font-medium text-[#2C221E]">
                            {etapa === "solicitar" ? "Esqueceu sua senha?" : "Digite o código"}
                        </h1>
                        {etapa === "codigo" && (
                            <p className="text-xs text-[#5F4E44] pt-1">
                                Enviamos um código de 6 dígitos para <strong>{email}</strong>
                            </p>
                        )}
                    </div>

                    {etapa === "solicitar" ? (
                        <form onSubmit={solicitarCodigo} className="space-y-4">
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
                                <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Nova senha</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={novaSenha}
                                        onChange={(e) => setNovaSenha(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                                    />
                                    <Lock className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Confirmar nova senha</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={confirmarSenha}
                                        onChange={(e) => setConfirmarSenha(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                                    />
                                    <Lock className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                                </div>
                            </div>

                            {erro && <p className="text-xs text-center text-[#C85A32]">{erro}</p>}

                            <button
                                type="submit"
                                disabled={carregando}
                                className="w-full bg-[#2C221E] text-[#F4EFE6] text-xs font-semibold uppercase tracking-wider py-3 rounded hover:bg-[#C85A32] transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {carregando ? "Enviando..." : "Enviar Código"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={confirmarCodigo} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Código de verificação</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={codigo}
                                        onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                                        placeholder="000000"
                                        className="w-full bg-[#EADFD0] text-center tracking-[6px] text-sm text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                                    />
                                    <KeyRound className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                                </div>
                            </div>

                            {erro && <p className="text-xs text-center text-[#C85A32]">{erro}</p>}

                            <button
                                type="submit"
                                disabled={carregando}
                                className="w-full bg-[#C85A32] text-white text-xs font-semibold uppercase tracking-wider py-3 rounded hover:bg-[#B04C27] transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {carregando ? "Confirmando..." : "Confirmar e Trocar Senha"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setEtapa("solicitar")}
                                className="w-full text-xs text-[#5F4E44] hover:underline"
                            >
                                Errei o e-mail, voltar
                            </button>
                        </form>
                    )}
                </div>
            </main>

            <footer className="border-t border-[#2C221E]/10 bg-[#EAE3D2]/40 py-6 text-center text-xs text-[#5F4E44]">
                <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                    <span>Recuperação segura de conta.</span>
                </div>
            </footer>
        </div>
    );
}