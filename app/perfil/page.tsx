"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, LogOut, Trash2, ShoppingBag } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function PerfilPage() {
    const [cliente, setCliente] = useState<any>(null);
    const [compras, setCompras] = useState<any[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [selecionados, setSelecionados] = useState<number[]>([]);

    useEffect(() => {
        const sessaoStr = localStorage.getItem("retroa_sessao");

        if (sessaoStr) {
            const dadosCliente = JSON.parse(sessaoStr);
            setCliente(dadosCliente);
            buscarPedidos(dadosCliente.email);
        } else {
            setCarregando(false);
        }
    }, []);

    const buscarPedidos = async (emailCliente: string) => {
        try {
            const { data, error } = await supabase
                .from("Pedidos")
                .select("*")
                .eq("cliente_email", emailCliente);

            if (error) {
                console.error("Erro ao buscar pedidos:", error.message);
            } else if (data) {
                setCompras(data);
            }
        } catch (err) {
            console.error("Erro inesperado:", err);
        } finally {
            setCarregando(false);
        }
    };

    const alternarSelecao = (id: number) => {
        setSelecionados((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const excluirSelecionados = async () => {
        if (selecionados.length === 0) return;
        if (!confirm(`Excluir ${selecionados.length} pedido(s) selecionado(s)?`)) return;

        const { error } = await supabase.from("Pedidos").delete().in("id", selecionados);

        if (error) {
            console.error("Erro ao excluir pedidos:", error.message);
            alert("Não foi possível excluir os pedidos selecionados. Tente novamente.");
            return;
        }

        setCompras((prev) => prev.filter((p) => !selecionados.includes(p.id)));
        setSelecionados([]);
    };

    const encerartSessao = () => {
        localStorage.removeItem("retroa_sessao");
        window.location.href = "/login";
    };

    if (!cliente && !carregando) {
        return (
            <div className="min-h-screen bg-[#F4EFE6] flex flex-col items-center justify-center p-6 text-[#2C221E]">
                <h1 className="text-xl font-bold mb-4">Você precisa estar logado.</h1>
                <Link
                    href="/login"
                    className="bg-[#2C221E] text-white px-6 py-2 rounded text-xs uppercase tracking-wider hover:bg-[#C85A32] transition-colors"
                >
                    Ir para Login
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4EFE6] text-[#2C221E] font-sans antialiased flex flex-col justify-between">
            {/* NAVBAR */}
            <nav className="border-b border-[#2C221E]/10 bg-[#F4EFE6]/95 backdrop-blur-md sticky top-0 z-40">
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
                        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5F4E44] hover:text-[#2C221E] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar ao Início</span>
                    </Link>
                </div>
            </nav>
            <main className="max-w-3xl mx-auto px-6 py-12 w-full flex-grow space-y-8">
                {cliente && (
                    <div className="bg-[#EAE3D2]/40 p-6 rounded-lg border border-[#2C221E]/10 space-y-4 shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#2C221E]/10 pb-4">
                            <div>
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#C85A32]">
                                    Cliente
                                </span>
                                <h1 className="text-xl font-bold">{cliente.nome}</h1>
                            </div>
                            <button
                                onClick={encerartSessao}
                                className="flex items-center gap-1 text-xs text-[#C85A32] hover:underline cursor-pointer transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Sair</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#5F4E44]">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#C85A32]" />
                                <span>{cliente.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#C85A32]" />
                                <span>{cliente.telefone || "Não informado"}</span>
                            </div>
                            <div className="flex items-center gap-2 md:col-span-2">
                                <MapPin className="w-4 h-4 text-[#C85A32]" />
                                <span>{cliente.endereco || "Não informado"}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* HISTÓRICO DE PEDIDOS */}
                <div className="bg-[#EAE3D2]/40 p-6 rounded-lg border border-[#2C221E]/10 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#2C221E]">
                            Histórico de Pedidos
                        </h2>
                        {selecionados.length > 0 && (
                            <button
                                onClick={excluirSelecionados}
                                className="flex items-center gap-1 text-[11px] text-[#C85A32] hover:underline cursor-pointer transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Excluir Selecionados ({selecionados.length})</span>
                            </button>
                        )}
                    </div>

                    {carregando ? (
                        <p className="text-xs text-[#5F4E44]">Carregando pedidos...</p>
                    ) : compras.length === 0 ? (
                        <div className="text-center py-6 space-y-3">
                            <p className="text-xs text-[#5F4E44]">
                                Você ainda não realizou nenhuma compra.
                            </p>
                            <Link
                                href="/produtos"
                                className="inline-flex items-center gap-2 bg-[#2C221E] text-[#F4EFE6] text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded hover:bg-[#C85A32] transition-colors"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Ir para o Catálogo
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {compras.map((pedido: any, index: number) => {
                                // Separa os itens pela vírgula para contar quantos são
                                const listaItens = pedido.itens ? pedido.itens.split(", ") : [];

                                return (
                                    <div
                                        key={pedido.id || index}
                                        className="bg-[#F4EFE6] p-4 rounded border border-[#2C221E]/5 space-y-2 hover:border-[#C85A32]/30 transition-all text-xs"
                                    >
                                        <div className="flex justify-between items-center border-b border-[#2C221E]/10 pb-2">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selecionados.includes(pedido.id)}
                                                    onChange={() => alternarSelecao(pedido.id)}
                                                    className="w-4 h-4 accent-[#C85A32] cursor-pointer"
                                                />
                                                <div>
                                                    <span className="font-bold">Pedido #{index + 1}</span>
                                                    <span className="text-[#5F4E44] ml-2">({pedido.data})</span>
                                                </div>
                                            </div>
                                            <span className="font-semibold text-[#C85A32] text-sm">
                                                R$ {Number(pedido.total).toFixed(2)}
                                            </span>
                                        </div>

                                        <div>
                                            <p className="font-semibold text-[#2C221E] mb-1">
                                                Itens comprados ({listaItens.length}):
                                            </p>
                                            <ul className="list-disc list-inside text-[#5F4E44] space-y-0.5">
                                                {listaItens.map((nomeItem: string, i: number) => (
                                                    <li key={i}>{nomeItem}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* FOOTER */}
            <footer className="border-t border-[#2C221E]/10 bg-[#EAE3D2]/40 py-6 text-center text-xs text-[#5F4E44]">
                <span>Área do Usuário - Retrôa</span>
            </footer>
        </div>
    );
}