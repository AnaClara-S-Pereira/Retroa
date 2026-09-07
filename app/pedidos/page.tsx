"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Clock, Truck, CheckCircle2, RotateCcw } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Pedido {
    id: string;
    codigo: string;
    itens: string;
    total: number;
    status: "pendente" | "despachado" | "entregue" | "devolucao";
    data: string;
}

export default function MeusPedidosPage() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        carregarPedidos();
    }, []);

    const carregarPedidos = async () => {
        const sessaoStr = localStorage.getItem("retroa_sessao");
        if (!sessaoStr) {
            window.location.href = "/login";
            return;
        }

        const cliente = JSON.parse(sessaoStr);

        // Busca os pedidos do cliente logado no Supabase
        const { data, error } = await supabase
            .from("Pedidos")
            .select("*")
            .eq("cliente_email", cliente.email);

        if (error) {
            console.error("Erro ao buscar pedidos:", error.message);
        } else if (data) {
            // Mapeia os dados garantindo que tenham um status válido para o fluxo
            const pedidosFormatados = data.map((p: any) => ({
                ...p,
                status: p.status || "pendente" // Define pendente como padrão caso a coluna esteja vazia
            }));
            setPedidos(pedidosFormatados);
        }
        setCarregando(false);
    };

    // Retorna a etapa atual para preencher a barra de progresso
    const obterProgresso = (status: string) => {
        switch (status) {
            case "pendente": return 1;
            case "despachado": return 2;
            case "entregue": return 3;
            case "devolucao": return 3;
            default: return 1;
        }
    };

    return (
        <div className="min-h-screen bg-[#EFECE6] text-[#2C221E] font-sans antialiased flex flex-col justify-between">
            <header className="border-b border-[#2C221E]/10 bg-[#EFECE6]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-stone-600 hover:text-[#2C221E] transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Voltar à Loja</span>
                    </Link>
                    <h1 className="text-sm font-serif tracking-widest uppercase">Painel do Cliente</h1>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-8 py-16 w-full flex-grow space-y-8">
                <div className="border-b border-[#2C221E]/10 pb-6">
                    <h2 className="text-3xl font-serif font-normal tracking-wide">Meus Pedidos</h2>
                    <p className="text-xs text-stone-500 font-sans tracking-wide mt-1">
                        Acompanhe o status de entrega e histórico das suas aquisições.
                    </p>
                </div>

                {carregando ? (
                    <div className="py-20 text-center text-xs font-mono text-stone-500 uppercase tracking-widest">
                        Carregando pedidos...
                    </div>
                ) : pedidos.length === 0 ? (
                    <div className="py-20 text-center space-y-4 bg-[#FAF8F5] rounded-3xl border border-[#2C221E]/10 p-8">
                        <Package className="w-10 h-10 text-stone-400 mx-auto" />
                        <p className="text-sm font-light text-stone-600">Você ainda não possui pedidos registrados.</p>
                        <Link href="/" className="inline-block bg-[#2C221E] text-white px-6 py-3 rounded-full text-xs uppercase tracking-widest font-medium hover:bg-[#C85A32] transition-all">
                            Explorar Curadoria
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pedidos.map((pedido) => {
                            const etapa = obterProgresso(pedido.status);
                            return (
                                <div key={pedido.id || pedido.codigo} className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#2C221E]/10 space-y-6 shadow-sm">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-4">
                                        <div>
                                            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block">Código do Pedido</span>
                                            <span className="text-sm font-mono font-medium text-[#2C221E]">{pedido.codigo || "RET-XXXX"}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block">Data</span>
                                            <span className="text-xs font-mono text-stone-600">{pedido.data}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block">Valor Total</span>
                                            <span className="text-xs font-mono font-medium text-[#C85A32]">R$ {Number(pedido.total).toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-[10px] font-medium uppercase tracking-widest text-stone-500 block">Peças Adquiridas</span>
                                        <p className="text-xs font-serif text-[#2C221E]">{pedido.itens}</p>
                                    </div>

                                    {/* Barra de Progresso Visual */}
                                    <div className="pt-4 space-y-3">
                                        <div className="flex justify-between text-[10px] uppercase tracking-wider font-medium text-stone-500">
                                            <span className={etapa >= 1 ? "text-[#2C221E] font-bold" : ""}>Aguardando</span>
                                            <span className={etapa >= 2 ? "text-[#2C221E] font-bold" : ""}>Despachado</span>
                                            <span className={etapa >= 3 && pedido.status !== "devolucao" ? "text-[#2C221E] font-bold" : ""}>Entregue</span>
                                            {pedido.status === "devolucao" && <span className="text-red-700 font-bold">Devolução</span>}
                                        </div>

                                        <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden flex">
                                            <div
                                                className={`h-full transition-all duration-500 ${pedido.status === 'devolucao' ? 'bg-red-700 w-full' : etapa === 1 ? 'w-1/3 bg-[#2C221E]' : etapa === 2 ? 'w-2/3 bg-[#2C221E]' : 'w-full bg-emerald-700'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <footer className="border-t border-[#2C221E]/10 py-8 text-center text-xs text-stone-500">
                <span>© 2026 Retrôa • Antiguidades e Curadorias.</span>
            </footer>
        </div>
    );
}