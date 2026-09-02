"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trash2, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

const PRODUTOS_MOCK = [
    { id: "1", nome: "Vaso de cerâmica artesanal marajoara", preco: 480.00, imagem: "/vaso.png" },
    { id: "2", nome: "Máquina de escrever Remington vintage", preco: 950.00, imagem: "/maquinaEscrever.png" },
    { id: "3", nome: "Abajur de mesa em latão e cúpula de vidro", preco: 720.00, imagem: "/abajur.png" },
    { id: "4", nome: "Rádio de mesa em caixa de madeira nobre", preco: 1280.00, imagem: "/radio.png" },
    { id: "5", nome: "Espelho de parede com moldura dourada entalhada", preco: 1150.00, imagem: "/espelho.png" },
    { id: "6", nome: "Poltrona em madeira nobre e palhinha indiana", preco: 2100.00, imagem: "/cadeira.png" },
];

export default function CarrinhoPage() {
    const [itensCarrinho, setItensCarrinho] = useState<any[]>([]);
    const [sucesso, setSucesso] = useState(false);
    const [carregando, setCarregando] = useState(false);

    useEffect(() => {
        const idsSalvos = JSON.parse(localStorage.getItem("retroa_carrinho") || "[]");
        const produtosNoCarrinho = PRODUTOS_MOCK.filter((p) => idsSalvos.includes(p.id));
        setItensCarrinho(produtosNoCarrinho);
    }, []);

    const removerItem = (id: string) => {
        const novosItens = itensCarrinho.filter((item) => item.id !== id);
        setItensCarrinho(novosItens);
        const novosIds = novosItens.map((item) => item.id);
        localStorage.setItem("retroa_carrinho", JSON.stringify(novosIds));
    };

    const total = itensCarrinho.reduce((acc, item) => acc + item.preco, 0);

    const finalizarCompra = async () => {
        const sessaoStr = localStorage.getItem("retroa_sessao");

        if (!sessaoStr) {
            alert("Você precisa estar logado para finalizar a compra!");
            window.location.href = "/login";
            return;
        }

        const cliente = JSON.parse(sessaoStr);
        setCarregando(true);

        const nomesItens = itensCarrinho.map(i => i.nome).join(", ");

        const novoPedido = {
            cliente_email: cliente.email,
            itens: nomesItens,
            total: total,
            data: new Date().toISOString().split("T")[0],
        };

        const { error } = await supabase
            .from("Pedidos")
            .insert([novoPedido]);

        if (error) {
            console.error("Erro ao finalizar pedido no Supabase:", error.message);
            alert("Erro ao registrar pedido: " + error.message);
            setCarregando(false);
            return;
        }

        localStorage.removeItem("retroa_carrinho");
        setCarregando(false);
        setSucesso(true);
    };

    if (sucesso) {
        return (
            <div className="min-h-screen bg-[#F4EFE6] flex flex-col items-center justify-center p-6 text-[#2C221E] text-center">
                <CheckCircle className="w-16 h-16 text-[#C85A32] mb-4" />
                <h1 className="font-vintage text-3xl font-bold mb-2">Pedido Confirmado!</h1>
                <p className="text-xs text-[#5F4E44] max-w-sm mb-6">
                    Sua compra foi registrada com sucesso no banco de dados. Acompanhe os detalhes no seu perfil.
                </p>
                <Link href="/" className="bg-[#2C221E] text-[#F4EFE6] px-6 py-3 rounded text-xs font-semibold uppercase tracking-wider">
                    Voltar ao Início
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4EFE6] text-[#2C221E] font-sans antialiased flex flex-col justify-between">
            <nav className="border-b border-[#2C221E]/10 bg-[#F4EFE6]/95">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <Link href="/">
                        <Image src="/logotransp.png" alt="Logo Retrôa" height={50} width={50} priority className="h-auto w-auto" />
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5F4E44] hover:text-[#2C221E]">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Continuar Comprando</span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12 w-full flex-grow">
                <h1 className="font-vintage text-3xl font-medium mb-8">Sua Sacola</h1>

                {itensCarrinho.length === 0 ? (
                    <div className="text-center py-12 text-[#5F4E44] space-y-4">
                        <p className="text-sm">Sua sacola está vazia.</p>
                        <Link href="/" className="inline-block bg-[#2C221E] text-[#F4EFE6] px-6 py-2.5 rounded text-xs uppercase tracking-wider font-semibold">
                            Explorar Catálogo
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-4">
                            {itensCarrinho.map((item) => (
                                <div key={item.id} className="flex items-center justify-between bg-[#EAE3D2]/40 p-4 rounded border border-[#2C221E]/10">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded overflow-hidden bg-[#EADFD0]">
                                            <Image src={item.imagem} alt={item.nome} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="font-vintage text-sm font-medium">{item.nome}</h3>
                                            <p className="font-mono text-xs font-semibold text-[#C85A32]">
                                                R$ {item.preco.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => removerItem(item.id)} className="text-[#5F4E44] hover:text-[#C85A32]">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="bg-[#EAE3D2]/40 p-6 rounded border border-[#2C221E]/10 h-fit space-y-4">
                            <h2 className="font-vintage text-lg font-medium">Resumo do Pedido</h2>
                            <div className="flex justify-between text-xs text-[#5F4E44] border-b border-[#2C221E]/10 pb-2">
                                <span>Subtotal</span>
                                <span>R$ {total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm text-[#2C221E]">
                                <span>Total</span>
                                <span className="text-[#C85A32]">R$ {total.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={finalizarCompra}
                                disabled={carregando}
                                className="w-full bg-[#2C221E] text-[#F4EFE6] text-xs font-semibold uppercase tracking-wider py-3 rounded hover:bg-[#C85A32] transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                {carregando ? "Processando..." : "Finalizar Compra"}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <footer className="border-t border-[#2C221E]/10 bg-[#EAE3D2]/40 py-6 text-center text-xs text-[#5F4E44]">
                <span>Checkout Seguro - Retrôa</span>
            </footer>
        </div>
    );
}