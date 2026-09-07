"use client";

import Link from "next/link";
import Image from "next/image";
import { AlertCircle, UserPlus, ArrowLeft } from "lucide-react";

export default function LoginErroPage() {
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
                </div>
            </nav>

            <main className="max-w-md mx-auto px-6 py-12 w-full flex-grow flex flex-col justify-center">
                <div className="bg-[#EAE3D2]/40 p-8 rounded-lg border border-[#2C221E]/10 space-y-6 text-center">
                    <div className="flex justify-center">
                        <div className="p-3 bg-[#C85A32]/10 rounded-full">
                            <AlertCircle className="w-10 h-10 text-[#C85A32]" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="font-vintage text-2xl font-medium text-[#2C221E]">
                            Conta não encontrada
                        </h1>
                        <p className="text-xs text-[#5F4E44] leading-relaxed">
                            A conta do Google selecionada não possui cadastro no nosso sistema. Faça seu cadastro primeiro para conseguir acessar.
                        </p>
                    </div>

                    <div className="space-y-3 pt-2">
                        <Link
                            href="/cadastro"
                            className="w-full flex items-center justify-center gap-2 bg-[#C85A32] text-white text-xs font-semibold uppercase tracking-wider py-3 rounded hover:bg-[#B04C27] transition-colors"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>Criar minha conta</span>
                        </Link>

                        <Link
                            href="/login"
                            className="w-full flex items-center justify-center gap-2 bg-transparent text-[#5F4E44] text-xs font-semibold hover:text-[#2C221E] py-2 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Tentar outro e-mail</span>
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="border-t border-[#2C221E]/10 bg-[#EAE3D2]/40 py-6 text-center text-xs text-[#5F4E44]">
                <span>Retrôa — Todos os direitos reservados.</span>
            </footer>
        </div>
    );
}