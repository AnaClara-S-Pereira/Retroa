"use client";

// CATALOGO COMPLETO: BUSCA, FILTRO POR CATEGORIA, ORDENACAO POR PRECO E MODAL DE DETALHES.

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

type OrdemPreco = "padrao" | "relevancia" | "crescente" | "decrescente";

const CATEGORIAS = [
    "Todas",
    "Cerâmica",
    "Escritório",
    "Iluminação",
    "Música",
    "Decoração",
    "Casa",
    "Eletrônicos",
];

const OPCOES_ORDEM = [
    { label: "Mais relevantes", value: "relevancia" },
    { label: "Menor preço", value: "crescente" },
    { label: "Maior preço", value: "decrescente" },
];

const PRODUTOS_INICIAIS_EXEMPLO = [
    {
        id: 1,
        nome: "Vaso de cerâmica artesanal marajoara",
        preco: 480.00,
        descricao: "Peça única em cerâmica, com pintura clássica marajoara.",
        categoria: "Cerâmica",
        imagem: "/vaso.png"
    },
    {
        id: 2,
        nome: "Máquina de escrever Remington vintage",
        preco: 950.00,
        descricao: "Máquina de escrever mecânica revisada e pronta para uso.",
        categoria: "Escritório",
        imagem: "/maquinaEscrever.png"
    },
    {
        id: 3,
        nome: "Abajur de mesa em latão e cúpula de vidro",
        preco: 720.00,
        descricao: "Abajur funcionando, base em latão envelhecido.",
        categoria: "Iluminação",
        imagem: "/abajur.png"
    },
    {
        id: 4,
        nome: "Rádio de mesa em caixa de madeira nobre",
        preco: 1280.00,
        descricao: "Relíquia rara, rádio de mesa com caixa de madeira.",
        categoria: "Música",
        imagem: "/radio.png"
    },
    {
        id: 5,
        nome: "Espelho de parede com moldura dourada",
        preco: 1150.00,
        descricao: "Peça rara, espelho com moldura entalhada e acabamento dourado.",
        categoria: "Decoração",
        imagem: "/espelho.png"
    },
    {
        id: 6,
        nome: "Poltrona em madeira nobre e palhinha indiana",
        preco: 2100.00,
        descricao: "Achado raro, poltrona em madeira maciça com assento em palhinha.",
        categoria: "Casa",
        imagem: "https://i.pinimg.com/1200x/c4/3d/d0/c43dd0fa3afa589bd99eab9a15cb0f56.jpg"
    },
    {
        id: 7,
        nome: "Telefone BlackBerry rosa",
        preco: 300.00,
        descricao: "Telefone antigo Retrô rosa.",
        categoria: "Eletrônicos",
        imagem: "https://i.pinimg.com/736x/c2/17/7b/c2177bc954bf4859da10d48f7259021e.jpg"
    },
    {
        id: 8,
        nome: "Nokia",
        preco: 400.00,
        descricao: "Telefone Nokia antigo Retrô.",
        categoria: "Eletrônicos",
        imagem: "https://i.pinimg.com/736x/63/d8/43/63d8436cd934bb616f7fb3950efd40d9.jpg"
    },
    {
        id: 9,
        nome: "DVD Video Magnavox",
        preco: 500.00,
        descricao: "DVD antigo cinza magnavox",
        categoria: "Música",
        imagem: "https://i.pinimg.com/736x/82/72/07/82720703a5df6499878129841416e4be.jpg"
    },
    {
        id: 10,
        nome: "Telefone de Disco Retrô Vermelho",
        preco: 250.00,
        descricao: "Clássico telefone fixo analógico na cor vermelha vibrante, com sistema de discagem circular em disco e cabo espiralado autêntico.",
        categoria: "Casa",
        imagem: "https://i.pinimg.com/1200x/e9/6d/2b/e96d2bbc8c7454dd49ad2afb9e89de3f.jpg"
    },
    {
        id: 11,
        nome: "Relógio de Bolso Dourado Antigo",
        preco: 450.00,
        descricao: "Elegante relógio de bolso clássico com acabamento dourado detalhado, visor com numeração romana gravada e tampa protetora articulada.",
        categoria: "Escritório",
        imagem: "https://i.pinimg.com/736x/84/8a/08/848a0823c5471a872d6aac90a1206981.jpg"
    },
    {
        id: 12,
        nome: "Gramofone Antigo com Corneta Metálica",
        preco: 680.00,
        descricao: "Gramofone clássico estilo vintage com base de madeira trabalhada, corneta acústica ampla em metal envelhecido e disco de vinil decorativo.",
        categoria: "Música",
        imagem: "https://i.pinimg.com/736x/1b/91/53/1b9153028281e764dd0454a1a59fd10c.jpg"
    },
    {
        id: 13,
        nome: "Walkman Toca-fitas Estéreo Vermelho",
        preco: 340.00,
        descricao: "Reprodutor de fita cassete portátil estilo vintage na cor vermelha, acompanhado de fones de ouvido clássicos com arco de metal.",
        categoria: "Música",
        imagem: "https://i.pinimg.com/736x/1b/91/53/1b9153028281e764dd0454a1a59fd10c.jpg"
    },
    {
        id: 14,
        nome: "Celular Tijolão Vintage",
        preco: 390.00,
        descricao: "Celular retrô clássico em formato tijolo, inspirado nos primeiros telefones celulares móveis com antena longa e teclado físico numérico.",
        categoria: "Eletrônicos",
        imagem: "https://i.pinimg.com/736x/c2/17/7b/c2177bc954bf4859da10d48f7259021e.jpg"
    },
    {
        id: 15,
        nome: "Câmera Instantânea Polaroid OneStep",
        preco: 380.00,
        descricao: "Clássica câmera instantânea Polaroid Land Camera OneStep com o icônico design vintage e faixa colorida frontal.",
        categoria: "Decoração",
        imagem: "https://i.pinimg.com/736x/95/23/b7/9523b7d80b45564c9e78f716b365841b.jpg"
    },
    {
        id: 16,
        nome: "Mini System Aiwa XG-5909 Vintage",
        preco: 1280.00,
        descricao: "Sistema de som compacto clássico da Aiwa com display digital iluminado, decks duplos para fitas cassete, leitor de CD e controles frontais completos.",
        categoria: "Música",
        imagem: "https://i.pinimg.com/736x/85/60/53/8560535e3d9d333dac735bc1305ae627.jpg"
    },
    {
        id: 17,
        nome: "Boombox Rádio CD Player Sanyo Rosa Y2K",
        preco: 490.00,
        descricao: "Aparelho de som portátil estilo boombox da Sanyo na cor rosa, decorado com adesivos estéticos e sistema BassXpander para reprodução de rádio AM/FM e CD.",
        categoria: "Música",
        imagem: "https://i.pinimg.com/736x/45/08/c3/4508c3aa6832b36433d7f7263cb9002e.jpg"
    }
];

type Usuario = { id?: number; nome?: string; email: string; foto_url?: string };

export default function ProdutosPage() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [busca, setBusca] = useState("");
    const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
    const [ordemPreco, setOrdemPreco] = useState<OrdemPreco>("relevancia");
    const [menuPrecoAberto, setMenuPrecoAberto] = useState(false);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const [carrinho, setCarrinho] = useState<string[]>([]);
    const [montado, setMontado] = useState(false);

    useEffect(() => {
        setMontado(true);
        if (typeof window !== "undefined") {
            const salvo = localStorage.getItem("retroa_carrinho");
            if (salvo) setCarrinho(JSON.parse(salvo));
        }

        const sessaoAtiva = localStorage.getItem("retroa_sessao");
        if (sessaoAtiva) setUsuario(JSON.parse(sessaoAtiva));

        const buscarProdutos = async () => {
            const { data, error } = await supabase
                .from("Produtos")
                .select("*")
                .order("id", { ascending: false });

            if (!error && data && data.length > 0) {
                setProdutos(data as Produto[]);
            } else {
                setProdutos(PRODUTOS_INICIAIS_EXEMPLO);
            }
            setCarregando(false);
        };

        buscarProdutos();
    }, []);

    useEffect(() => {
        if (montado) {
            localStorage.setItem("retroa_carrinho", JSON.stringify(carrinho));
        }
    }, [carrinho, montado]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setMenuPrecoAberto(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const produtosFiltrados = produtos
        .filter((p) => {
            const atendeCategoria = categoriaAtiva === "Todas" || p.categoria === categoriaAtiva;
            const atendeBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
            return atendeCategoria && atendeBusca;
        })
        .sort((a, b) => {
            if (ordemPreco === "crescente") return a.preco - b.preco;
            if (ordemPreco === "decrescente") return b.preco - a.preco;
            if (ordemPreco === "relevancia") return b.id - a.id;
            return 0;
        });

    const adicionarAoCarrinho = (id: string) => setCarrinho((prev) => [...prev, id]);

    const formatarPreco = (valor: number) =>
        Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    const opcaoPrecoSelecionada = OPCOES_ORDEM.find((o) => o.value === ordemPreco);

    return (
        <>
            <div className="min-h-screen bg-[#F4EFE6] text-[#2C221E] font-sans antialiased">
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
                                    {montado ? carrinho.length : 0}
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

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                            {CATEGORIAS.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoriaAtiva(cat)}
                                    className={`text-xs cursor-pointer font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${categoriaAtiva === cat
                                        ? "bg-[#2C221E] text-[#F4EFE6]"
                                        : "bg-[#EADFD0] text-[#5F4E44] hover:bg-[#E2D4C1]"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setMenuPrecoAberto(!menuPrecoAberto)}
                                className="bg-[#EADFD0] hover:bg-[#E2D4C1] text-xs font-semibold text-[#2C221E] pl-8 pr-7 py-1.5 rounded-full flex items-center gap-2 cursor-pointer transition-colors border border-transparent focus:border-[#C85A32] focus:outline-none shadow-sm"
                            >
                                <ArrowUpDown className="w-3.5 h-3.5 text-[#5F4E44] absolute left-3 pointer-events-none" />
                                <span>{opcaoPrecoSelecionada?.label || "Mais relevantes"}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-[#5F4E44] absolute right-2.5 transition-transform duration-200 ${menuPrecoAberto ? "rotate-180" : ""}`} />
                            </button>

                            {menuPrecoAberto && (
                                <div className="absolute right-0 mt-2 w-44 bg-[#F4EFE6] border border-[#2C221E]/15 rounded-2xl shadow-xl py-1.5 z-50 overflow-hidden">
                                    {OPCOES_ORDEM.map((opcao) => {
                                        const selecionado = ordemPreco === opcao.value;
                                        return (
                                            <button
                                                key={opcao.value}
                                                onClick={() => {
                                                    setOrdemPreco(opcao.value as OrdemPreco);
                                                    setMenuPrecoAberto(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${selecionado
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

                    {carregando ? (
                        <div className="text-center py-16 text-[#5F4E44] text-sm">Carregando produtos...</div>
                    ) : produtosFiltrados.length === 0 ? (
                        <div className="text-center py-16 text-[#5F4E44]">
                            <p className="text-lg font-vintage">Nenhuma peça encontrada.</p>
                            <button
                                onClick={() => {
                                    setBusca("");
                                    setCategoriaAtiva("Todas");
                                    setOrdemPreco("relevancia");
                                }}
                                className="mt-2 text-xs text-[#C85A32] underline underline-offset-4 cursor-pointer"
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

                {produtoSelecionado && (
                    <div className="fixed inset-0 z-50 bg-[#2C221E]/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-[#F4EFE6] rounded-lg max-w-2xl w-full p-6 relative shadow-2xl border border-[#2C221E]/20">
                            <button
                                onClick={() => setProdutoSelecionado(null)}
                                className="absolute top-4 right-4 text-[#5F4E44] hover:text-[#2C221E] cursor-pointer"
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
                                        className="w-full bg-[#C85A32] cursor-pointer text-white text-xs font-semibold uppercase tracking-wider py-3 rounded hover:bg-[#B04C27] transition-colors flex items-center justify-center gap-2"
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