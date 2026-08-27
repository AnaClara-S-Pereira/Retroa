"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles, HeartHandshake } from "lucide-react";

export default function SobrePage() {
    return (
        <>
            {/* ESTILOS DE FONTE PERSONALIZADOS */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .font-vintage { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

            {/* CONTAINER PRINCIPAL */}
            <div className="relative min-h-screen bg-[#F4EFE6] text-[#2C221E] font-sans antialiased overflow-hidden">

                {/* ELEMENTOS DE FUNDO DECORATIVOS (BLOBS E GRADIENTES) */}
                <div className="absolute top-12 left-[-10%] w-[500px] h-[500px] bg-[#C85A32]/15 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute top-[40%] right-[-5%] w-[450px] h-[450px] bg-[#D99B26]/15 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[10%] left-[20%] w-[600px] h-[600px] bg-[#8C6D53]/15 rounded-full blur-[140px] pointer-events-none" />

                {/* NAVEGAÇÃO E CABEÇALHO */}
                <header className="sticky top-0 z-40 bg-[#F4EFE6]/80 backdrop-blur-md border-b border-[#2C221E]/10">
                    <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-xs uppercase font-semibold tracking-wider text-[#5F4E44] hover:text-[#2C221E] transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Voltar aos produtos</span>
                        </Link>

                        <div className="w-20"></div> {/* Espaçador para alinhamento */}
                    </div>
                </header>

                {/* SEÇÃO HERO - APRESENTAÇÃO E HISTÓRIA */}
                <section className="relative max-w-6xl mx-auto px-6 pt-12 pb-16 z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                        {/* BLOCO DE TEXTO DE APRESENTAÇÃO */}
                        <div className="lg:col-span-6 space-y-6">
                            <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-[#C85A32] bg-[#C85A32]/10 px-3 py-1 rounded-full border border-[#C85A32]/20">
                                Nossa História
                            </span>
                            <h1 className="font-vintage text-4xl sm:text-5xl font-medium leading-[1.15] text-[#2C221E]">
                                Resgatamos objetos que guardam a <span className="italic font-normal text-[#C85A32]">alma do tempo</span>.
                            </h1>
                            <p className="text-sm sm:text-base text-[#5F4E44] leading-relaxed font-light">
                                A Retrôa nasceu do fascínio pelas memórias contidas em cada textura, marca e pátina. Acreditamos que relíquias e antiguidades não são apenas itens de decoração, mas fragmentos vivos da história e da arte que merecem continuar seu ciclo.
                            </p>
                            <p className="text-sm sm:text-base text-[#5F4E44] leading-relaxed font-light">
                                Cada peça do nosso acervo é garimpada individualmente em diferentes cantos do Brasil, passando por um minucioso processo de conservação que respeita sua originalidade.
                            </p>
                        </div>

                        {/* BLOCO DA IMAGEM DE DESTAQUE */}
                        <div className="lg:col-span-6 relative">
                            <div className="relative w-full h-[450px] sm:h-[520px] rounded-lg overflow-hidden shadow-2xl border border-[#2C221E]/10 bg-[#EADFD0]">
                                <Image
                                    src="/sobre.png"
                                    alt="Acervo de antiguidades da Retrôa"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>

                            {/* CARD DE CITAÇÃO DECORATIVO */}
                            <div className="absolute -bottom-6 -left-6 bg-[#2C221E] text-[#F4EFE6] p-6 rounded-lg hidden sm:block max-w-xs shadow-xl border border-[#F4EFE6]/10">
                                <p className="font-vintage italic text-lg leading-snug">
                                    "O tempo não desgasta a beleza, apenas a torna única."
                                </p>
                            </div>
                        </div>

                    </div>
                </section>

                {/* SEÇÃO DOS PILARES E MANIFESTO */}
                <section className="relative bg-[#EAE3D2]/60 backdrop-blur-sm border-y border-[#2C221E]/10 py-16 mt-8 z-10">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
                            <h2 className="font-vintage text-3xl font-medium text-[#2C221E]">Como Trabalhamos</h2>
                            <p className="text-xs text-[#5F4E44] uppercase tracking-wider">O cuidado por trás de cada detalhe do catálogo</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* CARD 1 - GARIMPO */}
                            <div className="bg-[#F4EFE6]/90 backdrop-blur-sm p-8 rounded-lg border border-[#2C221E]/10 shadow-sm space-y-4 hover:border-[#C85A32]/40 transition-all">
                                <div className="w-10 h-10 rounded-full bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32]">
                                    <Compass className="w-5 h-5" />
                                </div>
                                <h3 className="font-vintage text-xl text-[#2C221E]">Garimpo Atento</h3>
                                <p className="text-xs text-[#5F4E44] leading-relaxed">
                                    Percorremos feiras, casarões históricos e acervos particulares por todo o país em busca de achados raros e singulares.
                                </p>
                            </div>

                            {/* CARD 2 - PRESERVAÇÃO */}
                            <div className="bg-[#F4EFE6]/90 backdrop-blur-sm p-8 rounded-lg border border-[#2C221E]/10 shadow-sm space-y-4 hover:border-[#C85A32]/40 transition-all">
                                <div className="w-10 h-10 rounded-full bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32]">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <h3 className="font-vintage text-xl text-[#2C221E]">Preservação Consciente</h3>
                                <p className="text-xs text-[#5F4E44] leading-relaxed">
                                    Higienizamos e realizamos manutenções pontuais sem interferir nas marcas do tempo que conferem autenticidade à peça.
                                </p>
                            </div>

                            {/* CARD 3 - LOGÍSTICA */}
                            <div className="bg-[#F4EFE6]/90 backdrop-blur-sm p-8 rounded-lg border border-[#2C221E]/10 shadow-sm space-y-4 hover:border-[#C85A32]/40 transition-all">
                                <div className="w-10 h-10 rounded-full bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32]">
                                    <HeartHandshake className="w-5 h-5" />
                                </div>
                                <h3 className="font-vintage text-xl text-[#2C221E]">Novos Lares</h3>
                                <p className="text-xs text-[#5F4E44] leading-relaxed">
                                    Embalamos e enviamos cada objeto com cuidado reforçado para que a peça chegue com segurança ao seu novo destino.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SEÇÃO DE CHAMADA PARA AÇÃO (CTA) */}
                <section className="relative max-w-4xl mx-auto px-6 py-20 text-center space-y-6 z-10">
                    <h2 className="font-vintage text-3xl sm:text-4xl text-[#2C221E]">
                        Pronto para encontrar uma peça com história?
                    </h2>
                    <p className="text-sm text-[#5F4E44] max-w-md mx-auto">
                        Explore nosso catálogo completo e descubra objetos únicos prontos para compor o seu espaço.
                    </p>
                    <div className="pt-2">
                        <Link
                            href="/#produtos"
                            className="inline-block bg-[#2C221E] text-[#F4EFE6] text-xs font-semibold uppercase tracking-widest px-8 py-3.5 rounded hover:bg-[#C85A32] shadow-lg hover:shadow-xl transition-all"
                        >
                            Explorar produtos
                        </Link>
                    </div>
                </section>

                {/* FOOTER DA PÁGINA */}
                <footer className="relative border-t border-[#2C221E]/10 py-8 bg-[#EAE3D2]/40 z-10">
                    <div className="max-w-6xl mx-auto px-6 text-center text-xs text-[#5F4E44] space-y-2">
                        <p className="font-vintage text-sm text-[#2C221E]">Retrôa • Curadoria de Antiguidades</p>
                        <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
                    </div>
                </footer>

            </div>
        </>
    );
}