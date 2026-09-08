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
        imagem: "https://storage.googleapis.com/gpt-engineer-file-uploads/83501f6f-600d-4266-a5ed-61c1c84690ac/image-gen/22030188-a52b-48b7-9ce9-085cd79c80dc?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=go-api%40lovable-core-prod.iam.gserviceaccount.com%2F20260908%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260908T013154Z&X-Goog-Expires=3599&X-Goog-Signature=6f9948d3a3fa31ad9bf85dee9efa4f36e297755de4ee063660616d6917d0d25b5eccf9256c2c4d9f56c23897ec39f42050afd3d13e095cee8db47f47327dec96107b467dc145f947da26f7fdcd04cf27805f3f02c3b08f1b943bc11424408103c14e09269b71a8bd4ebce57a0367a770891ccd57eecea105c8afb832b3ab77c91c542a96b28e6a5c5aff1a6cd7a26ebb482e5a98a71d96823bc138e90f25ba495ffbf08ab65b564dcba356de2e4680dc53592b26c013293d91fe161f159f6076437b1dd03c72edeb3253677ad2e3843873a4445447092e36de6da9c7805d9bf28c73fbd4bfe86621741719b1d03d090fb31a002c9ab9ca4d9d9f7a793f579d92&X-Goog-SignedHeaders=host"
    },
    {
        id: 2,
        nome: "Máquina de escrever Remington vintage",
        preco: 950.00,
        descricao: "Máquina de escrever mecânica revisada e pronta para uso.",
        categoria: "Escritório",
        imagem: "https://storage.googleapis.com/gpt-engineer-file-uploads/83501f6f-600d-4266-a5ed-61c1c84690ac/image-gen/7b8f95cd-a7d4-4563-97c3-ee326abd8492?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=go-api%40lovable-core-prod.iam.gserviceaccount.com%2F20260908%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260908T013154Z&X-Goog-Expires=3599&X-Goog-Signature=9ae9389d5e7a794e2c5f30196f5e07c9a5a9bdbcaef7ac4429bca7ca5f159f04b8b8fc4b37330e0407c25b69458bb3d72656c5f150c2a741d8463e9cf74f66926348db11696ad0bf48983b9aa89a8b07122b845939c22ce8e9c46577cb56e5cc5cd5b9fdbafdf20ed4e120b4c7a404093661eb761ab7b0f2e0ce0db62018b14284ff0941156b4b49bcdd73a02555e727cf52a5a43363e57d1b7484cd6bdf3facf8f0291f3493b7fd715eefadd720ed25123c601f04696eb401897106443097cba04d34c713f861310c800655cc4695f3195bd5157690c18d33ff734f781d3aaa6449a0cfe2187ab4de436b862d0e1de72051877825dd6086abf09eccf13a092b&X-Goog-SignedHeaders=host"
    },
    {
        id: 3,
        nome: "Abajur de mesa em latão e cúpula de vidro",
        preco: 720.00,
        descricao: "Abajur funcionando, base em latão envelhecido.",
        categoria: "Iluminação",
        imagem: "https://storage.googleapis.com/gpt-engineer-file-uploads/83501f6f-600d-4266-a5ed-61c1c84690ac/image-gen/55132758-4bc6-49bd-ab9a-bf88b27651ba?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=go-api%40lovable-core-prod.iam.gserviceaccount.com%2F20260908%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260908T013154Z&X-Goog-Expires=3599&X-Goog-Signature=ce7b2fd2dc8ab3f0a926b5067a15d09e180e63d8f17dfc61e0bf00698fa193374306e2bf66e7761a316635fd2b0c453f9acca7adfa8f7129af3f6bfe5dc7dcb06cc840204de3d40ae9111febff1d4b728eb3194d1491ecb9b28ba42ae7ce455ca6fc7419f6feac27acdee7b18305a908be92887c90ef9164df26920018a003744aef15676ecaaf27faf87d6ce59842aaaa830c4588bb40a7891fc186d3a7ccea1e6217cad075c30776921eec21d2220bbe37b3f0141d8ea4040ac82acd448da57d5965bf8fa13b49db85aa31ce90b50ed0c5d41a8b2b9c050b004b3392a0f525cc7774238a5cb14ddf45f9b67f3fc23fbd8b25cd20780e0fc256938840538605&X-Goog-SignedHeaders=host"
    },
    {
        id: 4,
        nome: "Rádio de mesa em caixa de madeira nobre",
        preco: 1280.00,
        descricao: "Relíquia rara, rádio de mesa com caixa de madeira.",
        categoria: "Música",
        imagem: "https://storage.googleapis.com/gpt-engineer-file-uploads/83501f6f-600d-4266-a5ed-61c1c84690ac/image-gen/9a1ac950-9baa-4879-be13-7ae3343f5439?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=go-api%40lovable-core-prod.iam.gserviceaccount.com%2F20260908%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260908T013154Z&X-Goog-Expires=3599&X-Goog-Signature=aeeb6432755a4978d061d9248c180c2cfac4cf21d46c040fada04d798382afcdd978756736cced2522d03cc4b5773d99c54cb086aafbb5aa9d912b8c67693c054a179f79d90de0b9cbb947bb200003804f8e1fe4e9c3a023f440b4298040872d23391dceca5f9c0f8165d05345d03b5960e7e737d468eb12793310858a84d7d2f958a2a8550ebf4d31805748de79daf0325a8c7d2a697b4d23a79ceecf6b286c848af98ddeacec74d29f181ffa4fff4694a23f7d6a0d29a9c9ca8631ffec3360bbb12a35bfaae46cc6e1dc6d3c139ace4ffdf7281a9613c9551d6b9d84ffc8dd5380ec345932c40bb4b8f615e72f4f019fc1dffa03af7f4a26699c8225fc02e6&X-Goog-SignedHeaders=host"
    },
    {
        id: 5,
        nome: "Espelho de parede com moldura dourada",
        preco: 1150.00,
        descricao: "Peça rara, espelho com moldura entalhada e acabamento dourado.",
        categoria: "Decoração",
        imagem: "https://storage.googleapis.com/gpt-engineer-file-uploads/83501f6f-600d-4266-a5ed-61c1c84690ac/image-gen/02750807-c7c6-4d76-ab68-137e2fd7309e?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=go-api%40lovable-core-prod.iam.gserviceaccount.com%2F20260908%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260908T013154Z&X-Goog-Expires=3599&X-Goog-Signature=a34a894d0177959b9f9325b57e774522912de9d81e938e97ade8d508cfb9600f343fff9db3cda887ee30674118b616e2e49348977224db2a655990e42c2e8f32ef88cae98873980e02147040d421e809f60880286f3e09223c054783295aa99aa5eb10ed608123870f6e93c78e3c2c84e0da32b465a0a324d56527f80d1c3113ee6be044c2867a83d52747304bae84defcbeeb4497d22a995480c7fb4f56f3fd6b8a7d0106c939d4af1b2d854db5f9f46b7b49ff040997bba4bb63e7e0403325bb0fb6e8e12efcdc376ae7832596c7431b1852694eb94ba3db6fe17db57034c29db99fe020178ccbec42e02b81700f9ac04c5ab316f93af8daf1c751cf59cb6d&X-Goog-SignedHeaders=host"
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

export default function ProdutosPage() {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [busca, setBusca] = useState("");
    const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
    const [ordemPreco, setOrdemPreco] = useState<OrdemPreco>("relevancia");
    const [menuPrecoAberto, setMenuPrecoAberto] = useState(false);
    const [usuario, setUsuario] = useState<any>(null);
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

                        {/* Dropdown Customizado para Ordenar */}
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

                    {/* LISTA DE PRODUTOS */}
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

                {/* DETALHES DO PRODUTO (MODAL) */}
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