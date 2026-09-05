"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Tag,
    DollarSign,
    FileText,
    ImagePlus,
    Trash2,
    Plus,
    X,
    ShieldCheck,
    LogOut,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const CATEGORIAS = [
    "Cerâmica",
    "Escritório",
    "Iluminação",
    "Música",
    "Decoração",
    "Casa",
];

type Produto = {
    id: number;
    nome: string;
    preco: number;
    descricao: string;
    categoria: string;
    imagem: string;
};

type Cliente = {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    cpf?: string;
    cep?: string;
    data_nascimento?: string;
};

const ABAS = [
    { id: "dashboard", label: "Dashboard", icone: LayoutDashboard },
    { id: "produtos", label: "Produtos", icone: Package },
    { id: "pedidos", label: "Pedidos", icone: ShoppingBag },
    { id: "clientes", label: "Clientes", icone: Users },
] as const;

type AbaId = (typeof ABAS)[number]["id"];

export default function AdmPage() {
    const [autenticado, setAutenticado] = useState<boolean | null>(null);

    useEffect(() => {
        const sessao = localStorage.getItem("retroa_admin_sessao");
        if (!sessao) {
            window.location.href = "/login";
            return;
        }
        setAutenticado(true);
    }, []);

    const sairDoAdm = () => {
        localStorage.removeItem("retroa_admin_sessao");
        window.location.href = "/";
    };

    const [abaAtiva, setAbaAtiva] = useState<AbaId>("dashboard");

    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [carregandoDados, setCarregandoDados] = useState(true);

    const [mostrarFormProduto, setMostrarFormProduto] = useState(false);

    const carregarTudo = async () => {
        setCarregandoDados(true);
        const [resProdutos, resClientes, resPedidos] = await Promise.all([
            supabase.from("Produtos").select("*").order("id", { ascending: false }),
            supabase.from("Clientes").select("*").order("id", { ascending: false }),
            supabase.from("Pedidos").select("*").order("id", { ascending: false }),
        ]);

        if (resProdutos.data) setProdutos(resProdutos.data as Produto[]);
        if (resClientes.data) setClientes(resClientes.data as Cliente[]);
        if (resPedidos.data) setPedidos(resPedidos.data);
        setCarregandoDados(false);
    };

    useEffect(() => {
        if (autenticado) carregarTudo();
    }, [autenticado]);

    const excluirProduto = async (id: number) => {
        if (!confirm("Tem certeza que quer excluir esse produto?")) return;
        const { error } = await supabase.from("Produtos").delete().eq("id", id);
        if (!error) setProdutos((prev) => prev.filter((p) => p.id !== id));
    };

    const formatarPreco = (valor: number) =>
        Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    // Ainda checando a sessão ou redirecionando pro login
    if (!autenticado) {
        return <div className="min-h-screen bg-[#F4EFE6]" />;
    }

    // Autenticado: mostra o painel normalmente
    return (
        <div className="min-h-screen bg-[#F4EFE6] text-[#2C221E] font-sans antialiased">
            <nav className="border-b border-[#2C221E]/10 bg-[#F4EFE6]/95 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/logotransp.png"
                            alt="Logo Retrôa"
                            height={44}
                            width={44}
                            className="object-contain h-auto w-auto"
                            priority
                        />
                    </Link>
                    <span className="text-xs font-semibold uppercase tracking-widest text-[#C85A32]">
                        Painel Administrativo
                    </span>
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5F4E44] hover:text-[#2C221E]">
                            <ArrowLeft className="w-4 h-4" />
                            <span>Voltar ao Site</span>
                        </Link>
                        <button
                            onClick={sairDoAdm}
                            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5F4E44] hover:text-[#C85A32] cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sair</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* ABAS */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
                    {ABAS.map((aba) => {
                        const Icone = aba.icone;
                        return (
                            <button
                                key={aba.id}
                                onClick={() => setAbaAtiva(aba.id)}
                                className={`flex items-center gap-2 text-xs cursor-pointer font-semibold px-4 py-2.5 rounded-full transition-all whitespace-nowrap ${abaAtiva === aba.id
                                        ? "bg-[#2C221E] text-[#F4EFE6]"
                                        : "bg-[#EADFD0] text-[#5F4E44] hover:bg-[#E2D4C1]"
                                    }`}
                            >
                                <Icone className="w-4 h-4" />
                                {aba.label}
                            </button>
                        );
                    })}
                </div>

                {/* DASHBOARD */}
                {abaAtiva === "dashboard" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="bg-[#EAE3D2]/40 border border-[#2C221E]/10 rounded-lg p-6 space-y-2">
                            <Package className="w-5 h-5 text-[#C85A32]" />
                            <p className="text-3xl font-vintage font-medium">{produtos.length}</p>
                            <p className="text-xs text-[#5F4E44] uppercase tracking-wider">Produtos cadastrados</p>
                        </div>
                        <div className="bg-[#EAE3D2]/40 border border-[#2C221E]/10 rounded-lg p-6 space-y-2">
                            <ShoppingBag className="w-5 h-5 text-[#C85A32]" />
                            <p className="text-3xl font-vintage font-medium">{pedidos.length}</p>
                            <p className="text-xs text-[#5F4E44] uppercase tracking-wider">Pedidos recebidos</p>
                        </div>
                        <div className="bg-[#EAE3D2]/40 border border-[#2C221E]/10 rounded-lg p-6 space-y-2">
                            <Users className="w-5 h-5 text-[#C85A32]" />
                            <p className="text-3xl font-vintage font-medium">{clientes.length}</p>
                            <p className="text-xs text-[#5F4E44] uppercase tracking-wider">Clientes cadastrados</p>
                        </div>
                    </div>
                )}

                {/* PRODUTOS */}
                {abaAtiva === "produtos" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-vintage text-2xl font-medium">Produtos</h2>
                            <button
                                onClick={() => setMostrarFormProduto((v) => !v)}
                                className="flex items-center gap-2 bg-[#C85A32] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded hover:bg-[#B04C27] transition-colors cursor-pointer"
                            >
                                {mostrarFormProduto ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {mostrarFormProduto ? "Fechar" : "Novo Produto"}
                            </button>
                        </div>

                        {mostrarFormProduto && (
                            <FormNovoProduto
                                onCadastrado={() => {
                                    setMostrarFormProduto(false);
                                    carregarTudo();
                                }}
                            />
                        )}

                        <div className="bg-[#EAE3D2]/40 border border-[#2C221E]/10 rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-[#2C221E]/10 text-left text-[#5F4E44] uppercase tracking-wider">
                                        <th className="p-3">Foto</th>
                                        <th className="p-3">Nome</th>
                                        <th className="p-3">Categoria</th>
                                        <th className="p-3">Preço</th>
                                        <th className="p-3"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtos.map((p) => (
                                        <tr key={p.id} className="border-b border-[#2C221E]/5 last:border-0">
                                            <td className="p-3">
                                                <div className="relative w-12 h-12 rounded overflow-hidden bg-[#EADFD0]">
                                                    {p.imagem && (
                                                        <Image src={p.imagem} alt={p.nome} fill className="object-cover" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-3 font-medium">{p.nome}</td>
                                            <td className="p-3 text-[#5F4E44]">{p.categoria}</td>
                                            <td className="p-3 font-mono">{formatarPreco(p.preco)}</td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => excluirProduto(p.id)}
                                                    className="text-[#C85A32] hover:text-red-700 cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {produtos.length === 0 && !carregandoDados && (
                                        <tr>
                                            <td colSpan={5} className="p-6 text-center text-[#5F4E44]">
                                                Nenhum produto cadastrado ainda.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* PEDIDOS */}
                {abaAtiva === "pedidos" && (
                    <div className="space-y-6">
                        <h2 className="font-vintage text-2xl font-medium">Pedidos</h2>
                        <div className="bg-[#EAE3D2]/40 border border-[#2C221E]/10 rounded-lg overflow-x-auto">
                            {pedidos.length === 0 ? (
                                <p className="p-6 text-center text-xs text-[#5F4E44]">
                                    {carregandoDados ? "Carregando..." : "Nenhum pedido recebido ainda."}
                                </p>
                            ) : (
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-[#2C221E]/10 text-left text-[#5F4E44] uppercase tracking-wider">
                                            {Object.keys(pedidos[0]).map((coluna) => (
                                                <th key={coluna} className="p-3 whitespace-nowrap">{coluna}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedidos.map((pedido, i) => (
                                            <tr key={i} className="border-b border-[#2C221E]/5 last:border-0">
                                                {Object.keys(pedidos[0]).map((coluna) => (
                                                    <td key={coluna} className="p-3 whitespace-nowrap">
                                                        {String(pedido[coluna] ?? "-")}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <p className="text-[11px] text-[#5F4E44]">
                            Essa tabela mostra automaticamente todas as colunas que existirem na tabela "Pedidos" do Supabase.
                        </p>
                    </div>
                )}

                {/* CLIENTES */}
                {abaAtiva === "clientes" && (
                    <div className="space-y-6">
                        <h2 className="font-vintage text-2xl font-medium">Clientes</h2>
                        <div className="bg-[#EAE3D2]/40 border border-[#2C221E]/10 rounded-lg overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-[#2C221E]/10 text-left text-[#5F4E44] uppercase tracking-wider">
                                        <th className="p-3">Nome</th>
                                        <th className="p-3">E-mail</th>
                                        <th className="p-3">Telefone</th>
                                        <th className="p-3">Endereço</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientes.map((c) => (
                                        <tr key={c.id} className="border-b border-[#2C221E]/5 last:border-0">
                                            <td className="p-3 font-medium">{c.nome}</td>
                                            <td className="p-3 text-[#5F4E44]">{c.email}</td>
                                            <td className="p-3 text-[#5F4E44]">{c.telefone}</td>
                                            <td className="p-3 text-[#5F4E44]">{c.endereco}</td>
                                        </tr>
                                    ))}
                                    {clientes.length === 0 && !carregandoDados && (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-[#5F4E44]">
                                                Nenhum cliente cadastrado ainda.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <footer className="border-t border-[#2C221E]/10 bg-[#EAE3D2]/40 py-6 text-center text-xs text-[#5F4E44] mt-8">
                <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                    <span>Painel integrado ao banco de dados.</span>
                </div>
            </footer>
        </div>
    );
}

function FormNovoProduto({ onCadastrado }: { onCadastrado: () => void }) {
    const [nome, setNome] = useState("");
    const [preco, setPreco] = useState("");
    const [descricao, setDescricao] = useState("");
    const [categoria, setCategoria] = useState(CATEGORIAS[0]);
    const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
    const [previewImagem, setPreviewImagem] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    const selecionarImagem = (e: React.ChangeEvent<HTMLInputElement>) => {
        const arquivo = e.target.files?.[0];
        if (!arquivo) return;
        setArquivoImagem(arquivo);
        setPreviewImagem(URL.createObjectURL(arquivo));
    };

    const processarCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        setMensagem("");

        if (!arquivoImagem) {
            setMensagem("Selecione uma imagem para o produto.");
            return;
        }

        setCarregando(true);

        const nomeArquivo = `${Date.now()}-${arquivoImagem.name}`;
        const { error: erroUpload } = await supabase.storage
            .from("Produtos")
            .upload(nomeArquivo, arquivoImagem);

        if (erroUpload) {
            setMensagem("Erro ao enviar a imagem. Tente novamente.");
            setCarregando(false);
            return;
        }

        const { data: urlPublica } = supabase.storage.from("Produtos").getPublicUrl(nomeArquivo);

        const { error: erroInsert } = await supabase.from("Produtos").insert([
            {
                nome,
                preco: Number(preco),
                descricao,
                categoria,
                imagem: urlPublica.publicUrl,
            },
        ]);

        setCarregando(false);

        if (erroInsert) {
            setMensagem("Erro ao cadastrar o produto. Verifique os dados.");
            return;
        }

        onCadastrado();
    };

    return (
        <form
            onSubmit={processarCadastro}
            className="bg-[#EAE3D2]/40 border border-[#2C221E]/10 rounded-lg p-6 space-y-4"
        >
            <div>
                <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Nome da peça</label>
                <div className="relative">
                    <input
                        type="text"
                        required
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Vaso de cerâmica artesanal marajoara"
                        className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                    />
                    <Package className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Preço (R$)</label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={preco}
                            onChange={(e) => setPreco(e.target.value)}
                            placeholder="0,00"
                            className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                        />
                        <DollarSign className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Categoria</label>
                    <div className="relative">
                        <select
                            required
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32] appearance-none cursor-pointer"
                        >
                            {CATEGORIAS.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <Tag className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                    </div>
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Descrição</label>
                <div className="relative">
                    <textarea
                        required
                        rows={3}
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Detalhes sobre a peça, material, origem, estado de conservação..."
                        className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32] resize-none"
                    />
                    <FileText className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                </div>
            </div>

            <div>
                <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Foto do produto</label>
                <label
                    htmlFor="upload-imagem-adm"
                    className="flex items-center gap-3 bg-[#EADFD0] text-xs text-[#5F4E44] px-3 py-2.5 rounded cursor-pointer hover:bg-[#E2D4C1] transition-colors"
                >
                    <ImagePlus className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                        {arquivoImagem ? arquivoImagem.name : "Escolher imagem..."}
                    </span>
                </label>
                <input
                    id="upload-imagem-adm"
                    type="file"
                    accept="image/*"
                    onChange={selecionarImagem}
                    className="hidden"
                />

                {previewImagem && (
                    <div className="relative w-full h-40 mt-3 rounded overflow-hidden bg-[#EADFD0]">
                        <Image src={previewImagem} alt="Pré-visualização" fill className="object-cover" />
                    </div>
                )}
            </div>

            {mensagem && (
                <p className="text-xs text-center text-[#C85A32]">{mensagem}</p>
            )}

            <button
                type="submit"
                disabled={carregando}
                className="w-full bg-[#C85A32] text-white text-xs font-semibold uppercase tracking-wider py-3 rounded hover:bg-[#B04C27] transition-colors cursor-pointer disabled:opacity-50"
            >
                {carregando ? "Cadastrando..." : "Cadastrar Produto"}
            </button>
        </form>
    );
}