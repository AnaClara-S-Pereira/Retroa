"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ShoppingBag, X, User, ArrowLeft, ArrowUpDown, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Produto = {
    id: number;
    nome: string;
    preco: number;
    descricao: string;
    categoria: string;
    imagem: string;
};

type OrdemPreco = "padrao" | "crescente" | "decrescente";

const CATEGORIAS = [
    "Todas",
    "Cerâmica",
    "Escritório",
    "Iluminação",
    "Música",
    "Decoração",
    "Casa",
];

const OPCOES_ORDEM = [
    { label: "Todos os preços", value: "padrao" },
    { label: "Menor preço", value: "crescente" },
    { label: "Maior preço", value: "decrescente" },
];

export default function ProdutosPage() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [busca, setBusca] = useState("");
    const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
    const [ordemPreco, setOrdemPreco] = useState<OrdemPreco>("padrao");
    const [menuPrecoAberto, setMenuPrecoAberto] = useState(false);
    const [usuario, setUsuario] = useState<any>(null);
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const [carrinho, setCarrinho] = useState<string[]>(() => {
        if (typeof window !== "undefined") {
            const salvo = localStorage.getItem("retroa_carrinho");
            return salvo ? JSON.parse(salvo) : [];
        }
        return [];
    });

    useEffect(() => {
        const sessaoAtiva = localStorage.getItem("retroa_sessao");
        if (sessaoAtiva) setUsuario(JSON.parse(sessaoAtiva));

        const buscarProdutos = async () => {
            const { data, error } = await supabase
                .from("Produtos")
                .select("*")
                .order("id", { ascending: false });

            if (!error && data) setProdutos(data as Produto[]);
            setCarregando(false);
        };

        buscarProdutos();
    }, []);

    useEffect(() => {
        localStorage.setItem("retroa_carrinho", JSON.stringify(carrinho));
    }, [carrinho]);

    // Fecha o dropdown de preços se o usuário clicar fora dele
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setMenuPrecoAberto(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Aplica o filtro de busca e categoria, e em seguida ordena o resultado por preço
    const produtosFiltrados = produtos
        .filter((p) => {
            const atendeCategoria = categoriaAtiva === "Todas" || p.categoria === categoriaAtiva;
            const atendeBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
            return atendeCategoria && atendeBusca;
        })
        .sort((a, b) => {
            if (ordemPreco === "crescente") return a.preco - b.preco;
            if (ordemPreco === "decrescente") return b.preco - a.preco;
            return 0; // Mantém a ordem padrão (por ID)
        });

    const adicionarAoCarrinho = (id: string) => setCarrinho((prev) => [...prev, id]);

    const formatarPreco = (valor: number) =>
        Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const opcaoPrecoSelecionada = OPCOES_ORDEM.find((o) => o.value === ordemPreco);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,400&display=swap');
        .font-vintage { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

            <div className="min-h-screen bg-[#F4EFE6] text-[#2C221E] font-sans antialiased">
                {/* NAVBAR */}
                <nav className="sticky top-0 z-40 bg-[#F4EFE6]/95 backdrop-blur-md border-b border-[#2C221E]/10">
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

                        <div className="relative hidden md:block w-72">
                            <input
                                type="text"
                                placeholder="Buscar por peça..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="w-full bg-[#EADFD0] text-xs text-[#2C221E] placeholder-[#5F4E44] pl-9 pr-4 py-2 rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                            />
                            <Search className="w-4 h-4 text-[#5F4E44] absolute left-3 top-2.5" />
                        </div>

                        <div className="flex items-center gap-6 text-xs font-semibold tracking-wider uppercase text-[#5F4E44]">
                            <Link href="/" className="flex items-center gap-1.5 hover:text-[#2C221E] transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Início</span>
                            </Link>

                            <Link
                                href="/carrinho"
                                className="flex cursor-pointer items-center gap-2 border border-[#2C221E]/20 px-4 py-2 rounded-md hover:bg-[#2C221E] hover:text-[#F4EFE6] transition-all relative"
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>Sacola</span>
                                <span className="bg-[#C85A32] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                    {carrinho.length}
                                </span>
                            </Link>

                            {usuario ? (
                                <Link href="/perfil" className="flex items-center gap-2 hover:text-[#2C221E] transition-colors">
                                    <div className="w-7 h-7 rounded-full bg-[#C85A32] text-white flex items-center justify-center font-bold text-[11px] uppercase">
                                        {usuario.nome ? usuario.nome.charAt(0) : "U"}
                                    </div>
                                </Link>
                            ) : (
                                <Link href="/login" className="flex items-center gap-1.5 hover:text-[#2C221E] transition-colors">
                                    <User className="w-4 h-4 text-[#C85A32]" />
                                    <span>Entrar</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-6 py-12">
                    {/* CABEÇALHO DA PÁGINA */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#2C221E]/10 pb-4 mb-8 gap-4">
                        <div>
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#C85A32]">
                                Acervo Completo
                            </span>
                            <h1 className="font-vintage text-3xl font-medium text-[#2C221E]">
                                Catálogo de Produtos
                            </h1>
                            <p className="text-xs text-[#5F4E44] mt-1">
                                {carregando ? "Carregando..." : `${produtosFiltrados.length} itens disponíveis`}
                            </p>
                        </div>

<<<<<<< HEAD
                        {/* CONTROLES: CATEGORIAS E FILTRO DE PREÇO */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                            {/* Filtro por Categoria */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
                                {CATEGORIAS.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoriaAtiva(cat)}
                                        className={`text-xs cursor-pointer font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
                                            categoriaAtiva === cat
                                                ? "bg-[#2C221E] text-[#F4EFE6]"
                                                : "bg-[#EADFD0] text-[#5F4E44] hover:bg-[#E2D4C1]"
=======
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                            {CATEGORIAS.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoriaAtiva(cat)}
                                    className={`text-xs cursor-pointer font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${categoriaAtiva === cat
                                        ? "bg-[#2C221E] text-[#F4EFE6]"
                                        : "bg-[#EADFD0] text-[#5F4E44] hover:bg-[#E2D4C1]"
>>>>>>> 7e4d5e94ec9752cce8ac3c644a63553232450f2f
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Dropdown Customizado para Ordenar por Preço */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setMenuPrecoAberto(!menuPrecoAberto)}
                                    className="bg-[#EADFD0] hover:bg-[#E2D4C1] text-xs font-semibold text-[#2C221E] pl-8 pr-7 py-1.5 rounded-full flex items-center gap-2 cursor-pointer transition-colors border border-transparent focus:border-[#C85A32] focus:outline-none shadow-sm"
                                >
                                    <ArrowUpDown className="w-3.5 h-3.5 text-[#5F4E44] absolute left-3 pointer-events-none" />
                                    <span>{opcaoPrecoSelecionada?.label || "Todos os preços"}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-[#5F4E44] absolute right-2.5 transition-transform duration-200 ${menuPrecoAberto ? "rotate-180" : ""}`} />
                                </button>

                                {/* Lista de Opções Estilizada */}
                                {menuPrecoAberto && (
                                    <div className="absolute right-0 mt-2 w-44 bg-[#F4EFE6] border border-[#2C221E]/15 rounded-2xl shadow-xl py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                                        {OPCOES_ORDEM.map((opcao) => {
                                            const selecionado = ordemPreco === opcao.value;
                                            return (
                                                <button
                                                    key={opcao.value}
                                                    onClick={() => {
                                                        setOrdemPreco(opcao.value as OrdemPreco);
                                                        setMenuPrecoAberto(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                                                        selecionado
                                                            ? "bg-[#C85A32] text-white"
                                                            : "text-[#2C221E] hover:bg-[#EADFD0]"
                                                    }`}
                                                >
                                                    {opcao.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {carregando ? (
                        <div className="text-center py-16 text-[#5F4E44] text-sm">Carregando produtos...</div>
                    ) : produtosFiltrados.length === 0 ? (
                        <div className="text-center py-16 text-[#5F4E44]">
                            <p className="text-lg font-vintage">Nenhuma peça encontrada.</p>
                            <button
                                onClick={() => {
                                    setBusca("");
                                    setCategoriaAtiva("Todas");
                                    setOrdemPreco("padrao");
                                }}
                                className="mt-2 text-xs text-[#C85A32] underline underline-offset-4"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            {produtosFiltrados.map((item) => (
                                <div
                                    key={item.id}
                                    className="group block bg-[#EAE3D2]/30 rounded-lg p-3 border border-[#2C221E]/5 hover:border-[#2C221E]/20 transition-all"
                                >
                                    <div
                                        onClick={() => setProdutoSelecionado(item)}
                                        className="relative w-full h-[220px] rounded overflow-hidden mb-3 bg-[#EADFD0] cursor-pointer"
                                    >
                                        {item.imagem && (
                                            <Image
                                                src={item.imagem}
                                                alt={item.nome}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-1 mb-3">
                                        <p className="text-[10px] uppercase font-semibold tracking-wider text-[#C85A32]">
                                            {item.categoria}
                                        </p>
                                        <h3
                                            onClick={() => setProdutoSelecionado(item)}
                                            className="font-vintage text-base font-medium text-[#2C221E] hover:text-[#C85A32] cursor-pointer transition-colors line-clamp-1"
                                        >
                                            {item.nome}
                                        </h3>
                                        <p className="font-mono text-sm text-[#2C221E] font-semibold">
                                            {formatarPreco(item.preco)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => adicionarAoCarrinho(String(item.id))}
                                        className="w-full bg-[#2C221E] cursor-pointer text-[#F4EFE6] text-xs font-semibold uppercase tracking-wider py-2.5 rounded hover:bg-[#C85A32] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                        Adicionar à Sacola
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* DETALHES DO PRODUTO (MODAL) */}
                {produtoSelecionado && (
                    <div className="fixed inset-0 z-50 bg-[#2C221E]/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-[#F4EFE6] rounded-lg max-w-2xl w-full p-6 relative shadow-2xl border border-[#2C221E]/20">
                            <button
                                onClick={() => setProdutoSelecionado(null)}
                                className="absolute top-4 right-4 text-[#5F4E44] hover:text-[#2C221E]"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                                <div className="relative h-64 sm:h-80 w-full rounded overflow-hidden bg-[#EADFD0]">
                                    {produtoSelecionado.imagem && (
                                        <Image
                                            src={produtoSelecionado.imagem}
                                            alt={produtoSelecionado.nome}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <span className="text-[10px] uppercase font-semibold tracking-wider text-[#C85A32]">
                                        {produtoSelecionado.categoria}
                                    </span>
                                    <h3 className="font-vintage text-2xl font-medium text-[#2C221E]">
                                        {produtoSelecionado.nome}
                                    </h3>
                                    <p className="text-xs text-[#5F4E44] leading-relaxed">
                                        {produtoSelecionado.descricao}
                                    </p>
                                    <p className="font-mono text-xl font-semibold text-[#2C221E]">
                                        {formatarPreco(produtoSelecionado.preco)}
                                    </p>

                                    <button
                                        onClick={() => {
                                            adicionarAoCarrinho(String(produtoSelecionado.id));
                                            setProdutoSelecionado(null);
                                        }}
                                        className="w-full bg-[#C85A32] text-white text-xs font-semibold uppercase tracking-wider py-3 rounded hover:bg-[#B04C27] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        Garantir esta peça
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}