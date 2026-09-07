"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Trash2, CheckCircle, QrCode, CreditCard, Barcode, FileText, ShieldCheck } from "lucide-react";
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
    const [itensCarrinho, setItensCarrinho] = useState<any[]>(() => {
        if (typeof window === "undefined") return [];
        try {
            const idsSalvos = JSON.parse(localStorage.getItem("retroa_carrinho") || "[]");
            return PRODUTOS_MOCK.filter((p) => idsSalvos.includes(p.id));
        } catch (e) {
            return [];
        }
    });

    const [sucesso, setSucesso] = useState(false);
    const [carregando, setCarregando] = useState(false);
    const [metodoPagamento, setMetodoPagamento] = useState("pix");
    const [cpfNota, setCpfNota] = useState("");
    const [dadosUltimoPedido, setDadosUltimoPedido] = useState<any>(null);
    const [copiadoPix, setCopiadoPix] = useState(false);

    // Estados para o Frete consumindo a API interna (/api/checkout/shipping)
    const [cepInput, setCepInput] = useState("");
    const [dadosEndereco, setDadosEndereco] = useState<any>(null);
    const [opcoesFrete, setOpcoesFrete] = useState<any[]>([]);
    const [freteSelecionado, setFreteSelecionado] = useState<any>(null);
    const [carregandoFrete, setCarregandoFrete] = useState(false);

    useEffect(() => {
        const ids = itensCarrinho.map((item) => item.id);
        localStorage.setItem("retroa_carrinho", JSON.stringify(ids));
    }, [itensCarrinho]);

    const removerItem = (id: string) => {
        const novosItens = itensCarrinho.filter((item) => item.id !== id);
        setItensCarrinho(novosItens);
    };

    const subtotal = itensCarrinho.reduce((acc, item) => acc + item.preco, 0);
    const valorFrete = freteSelecionado ? freteSelecionado.preco : 0;
    const total = subtotal + valorFrete;

    // Função que chama a API interna do projeto (/api/checkout/shipping)
    const calcularFreteApi = async () => {
        if (!cepInput || cepInput.replace(/\D/g, "").length !== 8) {
            alert("Digite um CEP válido com 8 dígitos.");
            return;
        }

        setCarregandoFrete(true);
        setDadosEndereco(null);
        setOpcoesFrete([]);
        setFreteSelecionado(null);

        try {
            const resposta = await fetch("/api/checkout/shipping", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cep: cepInput })
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                alert(resultado.error || "Erro ao calcular o frete.");
                return;
            }

            setDadosEndereco(resultado.endereco);
            setOpcoesFrete(resultado.opcoesFrete);
            setFreteSelecionado(resultado.opcoesFrete[0]); // Seleciona o primeiro frete por padrão
        } catch (erro) {
            console.error("Erro na requisição:", erro);
            alert("Erro de conexão com o servidor de frete.");
        } finally {
            setCarregandoFrete(false);
        }
    };

    const finalizarcompra = async () => {
        const sessaoStr = localStorage.getItem("retroa_sessao");

        if (!sessaoStr) {
            alert("Você precisa estar logado para finalizar a compra!");
            window.location.href = "/login";
            return;
        }

        if (!freteSelecionado || !dadosEndereco) {
            alert("Por favor, calcule e selecione uma opção de frete informando o CEP.");
            return;
        }

        const cliente = JSON.parse(sessaoStr);
        setCarregando(true);

        const nomesItens = itensCarrinho.map(i => i.nome).join(", ");
        const codigoPedidoUnico = "RET-" + Math.floor(100000 + Math.random() * 900000);

        const linhaDigitavelBoleto = "34191.79001 01043.510047 91202.260003 1 " + Math.floor(10000000000 + Math.random() * 90000000000);
        const codigoBarrasBoleto = "341939120000" + Math.floor(100000000000 + Math.random() * 900000000000);
        const chavePixAleatoria = "00020126580014br.gov.bcb.pix0136retroa-e-commerce-oficial-2026-uuid5204000053039865405" + total.toFixed(2) + "5802BR5925RETROA COMERCIO DE ANTIG6009SAO PAULO62070503***6304";

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
            console.error("Erro ao registrar pedido no Supabase:", error.message);
            alert("Erro ao registrar pedido: " + error.message);
            setCarregando(false);
            return;
        }

        setDadosUltimoPedido({
            codigo: codigoPedidoUnico,
            clienteNome: cliente.nome || "Cliente Retrôa",
            clienteEmail: cliente.email,
            clienteCpf: cpfNota || "Não informado",
            metodo: metodoPagamento.toUpperCase(),
            itens: [...itensCarrinho],
            subtotal: subtotal,
            freteNome: freteSelecionado.nome,
            fretePreco: freteSelecionado.preco,
            enderecoDestino: `${dadosEndereco.logradouro}, ${dadosEndereco.bairro} - ${dadosEndereco.cidade}/${dadosEndereco.uf} (CEP: ${dadosEndereco.cep})`,
            total: total,
            data: new Date().toLocaleDateString(),
            vencimentoBoleto: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            linhaDigitavel: linhaDigitavelBoleto,
            codigoBarras: codigoBarrasBoleto,
            chavePix: chavePixAleatoria
        });

        localStorage.removeItem("retroa_carrinho");
        setItensCarrinho([]);
        setCarregando(false);
        setSucesso(true);
    };

    const copiarPix = () => {
        if (!dadosUltimoPedido?.chavePix) return;
        navigator.clipboard.writeText(dadosUltimoPedido.chavePix);
        setCopiadoPix(true);
        setTimeout(() => setCopiadoPix(false), 3000);
    };

    const imprimirDocumento = () => {
        window.print();
    };

    if (sucesso && dadosUltimoPedido) {
        return (
            <div className="min-h-screen bg-[#F4EFE6] py-12 px-4 flex flex-col items-center justify-center text-[#2C221E] relative overflow-hidden">
                <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#C85A32]/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[#E3B04B]/10 blur-3xl pointer-events-none" />

                <div className="max-w-2xl w-full bg-[#EAE3D2]/50 backdrop-blur-md p-8 rounded-3xl shadow-lg border border-[#2C221E]/10 space-y-8 relative z-10">
                    <div className="text-center space-y-3 border-b border-[#2C221E]/10 pb-6">
                        <div className="w-16 h-16 bg-[#C85A32]/10 text-[#C85A32] rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h1 className="font-vintage text-2xl font-bold tracking-tight text-[#2C221E]">Pedido Realizado com Sucesso!</h1>
                        <p className="text-xs text-[#5F4E44] max-w-md mx-auto">
                            Transação aprovada e integrada ao banco de dados Supabase via API. Comprovante emitido abaixo.
                        </p>
                    </div>

                    {dadosUltimoPedido.metodo === "BOLETO" && (
                        <div className="bg-[#EADFD0]/60 p-6 rounded-2xl border border-[#2C221E]/10 space-y-4">
                            <div className="flex items-center justify-between border-b border-[#2C221E]/10 pb-3">
                                <div className="flex items-center gap-2">
                                    <Barcode className="w-5 h-5 text-[#C85A32]" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#2C221E]">Ficha de Compensação - Boleto Bancário</span>
                                </div>
                                <span className="text-[11px] font-semibold bg-[#C85A32]/10 text-[#C85A32] px-2.5 py-1 rounded-full">Vence em: {dadosUltimoPedido.vencimentoBoleto}</span>
                            </div>
                            <div className="space-y-2 text-xs text-[#5F4E44] font-mono bg-[#EAE3D2] p-4 rounded-xl border border-[#2C221E]/10">
                                <p className="text-[10px] text-[#5F4E44]/70 uppercase font-sans">Linha Digitável:</p>
                                <p className="font-bold text-sm text-[#2C221E] tracking-wider select-all">{dadosUltimoPedido.linhaDigitavel}</p>
                            </div>
                        </div>
                    )}

                    {dadosUltimoPedido.metodo === "PIX" && (
                        <div className="bg-[#EADFD0]/60 p-6 rounded-2xl border border-[#2C221E]/10 text-center space-y-4">
                            <div className="flex items-center justify-center gap-2 border-b border-[#2C221E]/10 pb-3">
                                <QrCode className="w-5 h-5 text-[#C85A32]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-[#2C221E]">Pagamento Instantâneo via Pix</span>
                            </div>
                            <div className="space-y-2 max-w-md mx-auto">
                                <p className="text-[11px] text-[#5F4E44]">Copie a chave Pix abaixo para pagar:</p>
                                <div className="flex items-center gap-2 bg-[#EAE3D2] p-2 rounded-xl border border-[#2C221E]/10">
                                    <input
                                        type="text"
                                        readOnly
                                        value={dadosUltimoPedido.chavePix}
                                        className="w-full bg-transparent text-[11px] font-mono text-[#2C221E] focus:outline-none truncate px-2"
                                    />
                                    <button
                                        onClick={copiarPix}
                                        className="bg-[#2C221E] text-white text-[11px] px-3 py-1.5 rounded-lg font-semibold shrink-0 hover:bg-[#C85A32] transition-colors cursor-pointer"
                                    >
                                        {copiadoPix ? "Copiado!" : "Copiar"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-[#EADFD0]/60 p-6 rounded-2xl border border-[#2C221E]/10 space-y-4 text-xs font-sans">
                        <div className="flex justify-between items-center border-b border-[#2C221E]/10 pb-3">
                            <div>
                                <p className="font-bold text-sm text-[#2C221E]">Comprovante do Pedido</p>
                                <p className="text-[11px] text-[#5F4E44]">Retrôa Antiguidades Ltda</p>
                            </div>
                            <span className="font-mono text-xs font-bold text-[#C85A32] bg-[#C85A32]/10 px-2.5 py-1 rounded-lg border border-[#C85A32]/20">
                                {dadosUltimoPedido.codigo}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-2 text-[#5F4E44] text-[11px]">
                            <p><strong className="text-[#2C221E]">Comprador:</strong> {dadosUltimoPedido.clienteNome}</p>
                            <p><strong className="text-[#2C221E]">Data:</strong> {dadosUltimoPedido.data}</p>
                            <p><strong className="text-[#2C221E]">E-mail:</strong> {dadosUltimoPedido.clienteEmail}</p>
                            <p><strong className="text-[#2C221E]">Pagamento:</strong> {dadosUltimoPedido.metodo}</p>
                        </div>
                        <div className="border-t border-[#2C221E]/10 pt-2 text-[11px] text-[#5F4E44]">
                            <strong className="text-[#2C221E] block mb-0.5">Endereço de Entrega:</strong>
                            <p>{dadosUltimoPedido.enderecoDestino}</p>
                        </div>
                        <div className="border-t border-[#2C221E]/10 pt-3 space-y-2">
                            <p className="font-bold text-[#2C221E] text-[11px] uppercase tracking-wider">Itens e Frete:</p>
                            {dadosUltimoPedido.itens.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between text-[#5F4E44]">
                                    <span>{item.nome}</span>
                                    <span className="font-mono">R$ {item.preco.toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-[#5F4E44]">
                                <span>Frete ({dadosUltimoPedido.freteNome})</span>
                                <span className="font-mono">R$ {dadosUltimoPedido.fretePreco.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="border-t border-[#2C221E]/10 pt-3 flex justify-between items-center font-bold text-sm text-[#2C221E]">
                            <span>TOTAL PAGO:</span>
                            <span className="text-lg text-[#C85A32] font-mono">R$ {dadosUltimoPedido.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={imprimirDocumento}
                            className="flex-1 bg-[#2C221E] text-white py-3.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#C85A32] transition-all cursor-pointer shadow-sm"
                        >
                            <FileText className="w-4 h-4" /> Imprimir Comprovante
                        </button>
                        <Link
                            href="/"
                            className="flex-1 bg-[#C85A32] text-white py-3.5 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider text-center flex items-center justify-center hover:bg-[#B04C27] transition-all shadow-sm"
                        >
                            Voltar para a Loja
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4EFE6] text-[#2C221E] font-sans antialiased flex flex-col justify-between relative overflow-hidden">
            {/* Bolas/círculos elegantes no fundo para manter a estética vela/retrô */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#C85A32]/10 blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#E3B04B]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 left-1/4 w-80 h-80 rounded-full bg-[#C85A32]/10 blur-3xl pointer-events-none" />

            <nav className="border-b border-[#2C221E]/10 bg-[#F4EFE6]/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/">
                        <Image src="/logotransp.png" alt="Logo Retrôa" height={45} width={45} priority className="h-auto w-auto" />
                    </Link>
                    <Link href="/" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5F4E44] hover:text-[#2C221E] transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Continuar Comprando</span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-grow relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <h1 className="font-vintage text-3xl font-bold tracking-tight text-[#2C221E]">Carrinho de Compras</h1>
                    <span className="bg-[#C85A32] text-white text-[11px] font-mono px-2.5 py-0.5 rounded-full">{itensCarrinho.length} itens</span>
                </div>

                {itensCarrinho.length === 0 ? (
                    <div className="bg-[#EAE3D2]/50 backdrop-blur-md rounded-3xl p-16 text-center space-y-4 shadow-lg border border-[#2C221E]/10 max-w-xl mx-auto">
                        <p className="text-sm text-[#5F4E44] font-medium">Sua sacola está vazia no momento.</p>
                        <Link href="/" className="inline-block bg-[#C85A32] text-white px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-[#B04C27] transition-colors shadow-md">
                            Explorar Catálogo de Antiguidades
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-7 space-y-4">
                            {itensCarrinho.map((item) => (
                                <div key={item.id} className="bg-[#EAE3D2]/50 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-[#2C221E]/10 flex items-center justify-between gap-4 transition-all hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#EADFD0] shrink-0 border border-[#2C221E]/10">
                                            <Image src={item.imagem} alt={item.nome} fill className="object-cover" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="font-vintage text-sm font-semibold text-[#2C221E] line-clamp-2">{item.nome}</h3>
                                            <p className="font-mono text-sm font-bold text-[#C85A32]">
                                                R$ {item.preco.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removerItem(item.id)}
                                        className="text-[#5F4E44] hover:text-[#C85A32] p-2 rounded-xl hover:bg-[#C85A32]/10 transition-colors cursor-pointer"
                                        title="Remover item"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-5 bg-[#EAE3D2]/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-[#2C221E]/10 space-y-6 sticky top-24">
                            <h2 className="font-vintage text-xl font-bold tracking-tight text-[#2C221E] border-b border-[#2C221E]/10 pb-4">Resumo do Pedido</h2>

                            <div className="space-y-4">
                                {/* Bloco de Consulta de Frete via API (/api/checkout/shipping) */}
                                <div className="space-y-3 bg-[#EADFD0]/70 p-4 rounded-2xl border border-[#2C221E]/10">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F4E44] block">Calcular Frete</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="00000-000"
                                            maxLength={9}
                                            value={cepInput}
                                            onChange={(e) => setCepInput(e.target.value)}
                                            className="w-full bg-[#F4EFE6] text-xs text-[#2C221E] placeholder-[#8C7A70] px-3.5 py-2.5 rounded-xl border border-[#2C221E]/10 focus:outline-none focus:ring-2 focus:ring-[#C85A32] font-mono transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={calcularFreteApi}
                                            disabled={carregandoFrete}
                                            className="bg-[#2C221E] text-white text-xs px-4 py-2.5 rounded-xl font-semibold hover:bg-[#C85A32] transition-colors shrink-0 cursor-pointer shadow-sm"
                                        >
                                            {carregandoFrete ? "..." : "Consultar"}
                                        </button>
                                    </div>

                                    {dadosEndereco && (
                                        <div className="text-[11px] text-[#2C221E] bg-[#C85A32]/10 p-2.5 rounded-xl border border-[#C85A32]/20 space-y-0.5">
                                            <p className="font-semibold text-[#C85A32]">Endereço Encontrado:</p>
                                            <p>{dadosEndereco.logradouro}, {dadosEndereco.bairro} - {dadosEndereco.cidade}/{dadosEndereco.uf}</p>
                                        </div>
                                    )}

                                    {opcoesFrete.length > 0 && (
                                        <div className="space-y-2 pt-1">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5F4E44]">Selecione o Frete:</p>
                                            {opcoesFrete.map((opcao) => (
                                                <label key={opcao.id} className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${freteSelecionado?.id === opcao.id ? 'border-[#C85A32] bg-[#C85A32]/10 text-[#2C221E] font-medium' : 'border-[#2C221E]/10 bg-[#F4EFE6] text-[#5F4E44]'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="radio"
                                                            name="frete"
                                                            checked={freteSelecionado?.id === opcao.id}
                                                            onChange={() => setFreteSelecionado(opcao)}
                                                            className="accent-[#C85A32]"
                                                        />
                                                        <span>{opcao.nome} ({opcao.prazo})</span>
                                                    </div>
                                                    <span className="font-mono font-bold">R$ {opcao.preco.toFixed(2)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F4E44] block mb-1.5">CPF na Nota Fiscal (Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00"
                                        value={cpfNota}
                                        onChange={(e) => setCpfNota(e.target.value)}
                                        className="w-full bg-[#EADFD0]/70 text-xs text-[#2C221E] placeholder-[#8C7A70] px-4 py-3 rounded-xl border border-[#2C221E]/10 focus:outline-none focus:ring-2 focus:ring-[#C85A32] font-mono transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#5F4E44] block mb-2">Forma de Pagamento</label>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setMetodoPagamento("pix")}
                                            className={`py-3 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${metodoPagamento === 'pix' ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm' : 'bg-[#EADFD0]/70 text-[#5F4E44] border-[#2C221E]/10 hover:bg-[#EADFD0]'}`}
                                        >
                                            <QrCode className="w-4 h-4" /> Pix
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMetodoPagamento("credito")}
                                            className={`py-3 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${metodoPagamento === 'credito' ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm' : 'bg-[#EADFD0]/70 text-[#5F4E44] border-[#2C221E]/10 hover:bg-[#EADFD0]'}`}
                                        >
                                            <CreditCard className="w-4 h-4" /> Crédito
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMetodoPagamento("debito")}
                                            className={`py-3 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${metodoPagamento === 'debito' ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm' : 'bg-[#EADFD0]/70 text-[#5F4E44] border-[#2C221E]/10 hover:bg-[#EADFD0]'}`}
                                        >
                                            <CreditCard className="w-4 h-4" /> Débito
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMetodoPagamento("boleto")}
                                            className={`py-3 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${metodoPagamento === 'boleto' ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-sm' : 'bg-[#EADFD0]/70 text-[#5F4E44] border-[#2C221E]/10 hover:bg-[#EADFD0]'}`}
                                        >
                                            <Barcode className="w-4 h-4" /> Boleto
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-[#2C221E]/10 pt-4 space-y-2">
                                <div className="flex justify-between text-xs text-[#5F4E44]">
                                    <span>Subtotal</span>
                                    <span className="font-mono">R$ {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-[#5F4E44]">
                                    <span>Frete</span>
                                    <span className="font-mono">R$ {valorFrete.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base text-[#2C221E] pt-2 border-t border-[#2C221E]/10">
                                    <span>Total</span>
                                    <span className="text-[#C85A32] font-mono text-lg">R$ {total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={finalizarcompra}
                                disabled={carregando}
                                className="w-full bg-[#C85A32] text-white text-xs font-bold uppercase tracking-wider py-4 rounded-xl hover:bg-[#B04C27] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#C85A32]/20 flex items-center justify-center gap-2"
                            >
                                {carregando ? "Processando..." : "Finalizar Compra com Segurança"}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            <footer className="border-t mt-10 border-[#2C221E]/10 bg-[#3B5249]/90 py-8 text-center text-xs text-[#e6ddd8] relative z-10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <span>© 2026 Retrôa - E-commerce de Antiguidades. Todos os direitos reservados.</span>
                </div>
            </footer>
        </div>
    );
}