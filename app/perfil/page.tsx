"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, Package, Pencil, ShoppingBag, Trash2, X, LogOut, User, CreditCard, Bell, Ticket, Coins, ShieldCheck, ChevronRight, Clock, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";

type Cliente = { email: string; nome: string; telefone?: string; endereco?: string; foto_url?: string };
type Pedido = { id: number; cliente_email?: string; status?: string; total?: number | string; itens?: string; data?: string; created_at?: string; codigo_rastreio?: string };
type Cartao = { id: string; numero: string; validade: string; titular: string; bandeira: string };
type Status = "pendente" | "processando" | "enviado" | "entregue" | "cancelado";
type AbaPainel = "perfil" | "cartoes" | "enderecos" | "senha" | "cookies" | "privacidade" | "compras" | "notificacoes" | "cupons" | "moedas";

const statusNormalizado = (s?: string): Status => {
    const v = String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (v.includes("entreg")) return "entregue";
    if (v.includes("envi")) return "enviado";
    if (v.includes("process")) return "processando";
    if (v.includes("cancel")) return "cancelado";
    return "pendente";
};

const preco = (v?: number | string) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const data = (v?: string) => {
    if (!v) return "Data não informada";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
};
const iniciais = (n: string) => {
    const p = n.trim().split(" ").filter(Boolean);
    return p.length > 1 ? `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase() : (p[0]?.slice(0, 2) || "R").toUpperCase();
};

export default function PerfilPage() {
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [compras, setCompras] = useState<Pedido[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [abaAtiva, setAbaAtiva] = useState<AbaPainel>("perfil");
    const [filtroStatus, setFiltroStatus] = useState<string>("todos");
    const [selecionados, setSelecionados] = useState<number[]>([]);

    const [pedidoAndamentoId, setPedidoAndamentoId] = useState<number | null>(null);

    const [editando, setEditando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [enviandoFoto, setEnviandoFoto] = useState(false);
    const [form, setForm] = useState({ nome: "", telefone: "", endereco: "" });

    // Estados para Cartões
    const [cartoes, setCartoes] = useState<Cartao[]>([
        { id: "1", numero: "•••• •••• •••• 4092", validade: "12/28", titular: "CLIENTE RETROA", bandeira: "Mastercard" }
    ]);
    const [modalCartaoAberto, setModalCartaoAberto] = useState(false);
    const [novoCartao, setNovoCartao] = useState({ numero: "", validade: "", cvv: "", titular: "" });

    // Estados para Senha com visibilidade
    const [senhaForm, setSenhaForm] = useState({ atual: "", nova: "", confirma: "" });
    const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
    const [mostrarSenhaNova, setMostrarSenhaNova] = useState(false);

    // Estados de Configurações
    const [notifConfig, setNotifConfig] = useState({ email: true, whatsapp: false, promocoes: true });
    const [cookieConfig, setCookieConfig] = useState({ essenciais: true, analiticos: true, marketing: false });
    const [privacidadeConfig, setPrivacidadeConfig] = useState({ perfilPublico: false, compartilharDadosParceiros: false, exibirHistorico: true });

    const fotoRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const raw = localStorage.getItem("retroa_sessao");
        if (!raw) return setCarregando(false);
        try {
            const c = JSON.parse(raw) as Cliente;
            setCliente(c);
            setForm({ nome: c.nome || "", telefone: c.telefone || "", endereco: c.endereco || "" });
            if (c.email) buscarPedidos(c.email); else setCarregando(false);
        } catch (e) { console.error(e); setCarregando(false); }
    }, []);

    async function buscarPedidos(email: string) {
        setCarregando(true);
        const { data: pedidos, error } = await supabase.from("Pedidos").select("*").eq("cliente_email", email).order("id", { ascending: false });
        if (error) { console.error(error); setCompras([]); } else setCompras((pedidos || []) as Pedido[]);
        setCarregando(false);
    }

    function atualizarSessao(dados: Partial<Cliente>) {
        const raw = localStorage.getItem("retroa_sessao");
        if (!raw) return;
        try {
            const nova = { ...JSON.parse(raw), ...dados } as Cliente;
            localStorage.setItem("retroa_sessao", JSON.stringify(nova));
            setCliente(nova);
        } catch (e) { console.error(e); }
    }

    async function selecionarFoto(e: ChangeEvent<HTMLInputElement>) {
        const arquivo = e.target.files?.[0];
        if (!arquivo || !cliente) return;
        if (!arquivo.type.startsWith("image/")) return alert("Escolha uma imagem válida.");
        if (arquivo.size > 3 * 1024 * 1024) return alert("A imagem deve ter no máximo 3MB.");
        setEnviandoFoto(true);
        const leitor = new FileReader();
        leitor.onload = async () => {
            const foto = leitor.result as string;
            const { error } = await supabase.from("Clientes").update({ foto_url: foto }).eq("email", cliente.email);
            if (error) { console.error(error); alert("Não foi possível salvar a foto."); }
            else atualizarSessao({ foto_url: foto });
            setEnviandoFoto(false);
        };
        leitor.onerror = () => { alert("Não foi possível carregar a imagem."); setEnviandoFoto(false); };
        leitor.readAsDataURL(arquivo);
    }

    function adicionarCartao(e: React.FormEvent) {
        e.preventDefault();
        if (!novoCartao.numero || !novoCartao.validade || !novoCartao.titular) {
            return alert("Preencha todos os campos do cartão.");
        }
        const ultimosDigitos = novoCartao.numero.slice(-4);
        const cartaoFormatado: Cartao = {
            id: Date.now().toString(),
            numero: `•••• •••• •••• ${ultimosDigitos}`,
            validade: novoCartao.validade,
            titular: novoCartao.titular.toUpperCase(),
            bandeira: "Cartão"
        };
        setCartoes([...cartoes, cartaoFormatado]);
        setNovoCartao({ numero: "", validade: "", cvv: "", titular: "" });
        setModalCartaoAberto(false);
        alert("Cartão adicionado com sucesso!");
    }

    function excluirCartao(id: string) {
        if (confirm("Deseja realmente remover este cartão?")) {
            setCartoes(cartoes.filter(c => c.id !== id));
        }
    }

    function alterarSenha(e: React.FormEvent) {
        e.preventDefault();
        if (!senhaForm.atual || !senhaForm.nova || !senhaForm.confirma) {
            return alert("Preencha todos os campos de senha.");
        }
        if (senhaForm.nova.length < 6) {
            return alert("A nova senha deve ter pelo menos 6 caracteres.");
        }
        if (senhaForm.nova !== senhaForm.confirma) {
            return alert("A nova senha e a confirmação não coincidem.");
        }
        alert("Senha alterada com sucesso!");
        setSenhaForm({ atual: "", nova: "", confirma: "" });
    }

    function iniciarEdicao() {
        if (!cliente) return;
        setForm({ nome: cliente.nome || "", telefone: cliente.telefone || "", endereco: cliente.endereco || "" });
        setEditando(true);
    }

    function cancelarEdicao() {
        if (!cliente) return;
        setForm({ nome: cliente.nome || "", telefone: cliente.telefone || "", endereco: cliente.endereco || "" });
        setEditando(false);
    }

    async function salvarPerfil() {
        if (!cliente) return;
        if (!form.nome.trim()) return alert("Digite seu nome.");
        setSalvando(true);
        const dados = { nome: form.nome.trim(), telefone: form.telefone.trim(), endereco: form.endereco.trim() };
        const { error } = await supabase.from("Clientes").update(dados).eq("email", cliente.email);
        if (error) { console.error(error); alert("Não foi possível atualizar seus dados."); setSalvando(false); return; }
        atualizarSessao(dados);
        setEditando(false);
        setSalvando(false);
    }

    function alternarPedido(id: number) {
        setSelecionados(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    }

    function selecionarTodos() {
        setSelecionados(selecionados.length === comprasFiltradas.length ? [] : comprasFiltradas.map(p => p.id));
    }

    async function excluirSelecionados() {
        if (!selecionados.length || !confirm(`Deseja excluir ${selecionados.length} pedido(s) do seu histórico?`)) return;
        const { error } = await supabase.from("Pedidos").delete().in("id", selecionados);
        if (error) return alert("Não foi possível excluir os pedidos.");
        setCompras(p => p.filter(x => !selecionados.includes(x.id)));
        setSelecionados([]);
        setPedidoAndamentoId(null);
    }

    function sair() {
        localStorage.removeItem("retroa_sessao");
        window.location.href = "/login";
    }

    const comprasFiltradas = compras.filter(p => {
        if (filtroStatus === "todos") return true;
        return statusNormalizado(p.status) === filtroStatus;
    });

    const pedidoSelecionadoAndamento = compras.find(p => p.id === pedidoAndamentoId);

    if (carregando && !cliente) return <main className="flex min-h-screen items-center justify-center bg-[#EFE4D3] text-[#2C221E]"><div className="text-center"><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#C89B51] border-t-[#3B5249]" /><p className="font-serif text-lg tracking-wide">Abrindo seu espaço...</p><p className="mt-1 text-sm opacity-50">Só um instante.</p></div></main>;

    if (!cliente) return (
        <main className="min-h-screen bg-[#EFE4D3] text-[#2C221E]">
            <Link href="/" className="flex items-center">
                <Image src="/logotransp.png" alt="Logo Retrôa" height={50} width={50} className="object-contain h-auto w-auto" priority />
            </Link>
        </main>
    );

    const atualizarCampo = (campo: keyof typeof form, valor: string) => setForm(f => ({ ...f, [campo]: valor }));

    return (
        <main className="relative min-h-screen bg-[#EFE4D3] text-[#2C221E] selection:bg-[#D7C3A0] overflow-hidden">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#3B5249]/10 blur-3xl pointer-events-none" />
            <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#8C3A29]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-[#C89B51]/15 blur-3xl pointer-events-none" />

            <header className="relative z-10 bg-[#3B5249] text-[#EFE4D3] text-xs py-2 px-6 md:px-10 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4 opacity-80">
                    <span>Peças antigas, novas histórias.</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/" className="hover:underline flex items-center gap-1.5"><ArrowLeft className="h-3.5 w-3.5" /> Voltar à Loja</Link>
                    <button onClick={sair} className="hover:underline flex items-center gap-1.5"><LogOut className="h-3.5 w-3.5" /> Sair</button>
                </div>
            </header>

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-10 mt-14">
                <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8">

                    <aside className="space-y-6 bg-[#E5D9C5]/60 backdrop-blur-md p-5 border border-[#2C221E]/10 shadow-sm rounded-lg">
                        <div className="flex items-center gap-3 pb-4 border-b border-[#2C221E]/10">
                            <div className="relative h-12 w-12 overflow-hidden shrink-0 shadow-sm rounded-full">
                                {cliente.foto_url ? (
                                    <Image src={cliente.foto_url} alt={cliente.nome} fill unoptimized className="object-cover sepia-[0.15]" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-[#3B5249] font-serif text-sm text-[#EFE4D3]">
                                        {iniciais(cliente.nome)}
                                    </div>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] uppercase tracking-wider opacity-50">Bem-vindo(a),</p>
                                <p className="font-serif text-sm truncate font-bold text-[#2C221E]">{cliente.nome}</p>
                            </div>
                        </div>

                        <nav className="space-y-4 text-sm">
                            <div>
                                <div className="flex items-center gap-2.5 font-bold text-[#8C3A29] mb-2.5">
                                    <User className="h-4 w-4" />
                                    <span>Minha Conta</span>
                                </div>
                                <div className="pl-6 space-y-2 text-xs">
                                    <button onClick={() => setAbaAtiva("perfil")} className={`block cursor-pointer text-left transition-all ${abaAtiva === "perfil" ? "text-[#8C3A29] font-bold translate-x-1" : "opacity-75 hover:opacity-100 hover:translate-x-0.5"}`}>Perfil</button>
                                    <button onClick={() => setAbaAtiva("cartoes")} className={`block cursor-pointer text-left transition-all ${abaAtiva === "cartoes" ? "text-[#8C3A29] font-bold translate-x-1" : "opacity-75 hover:opacity-100 hover:translate-x-0.5"}`}>Cartões / Contas Bancárias</button>
                                    <button onClick={() => setAbaAtiva("enderecos")} className={`block cursor-pointer text-left transition-all ${abaAtiva === "enderecos" ? "text-[#8C3A29] font-bold translate-x-1" : "opacity-75 hover:opacity-100 hover:translate-x-0.5"}`}>Endereços</button>
                                    <button onClick={() => setAbaAtiva("senha")} className={`block cursor-pointer text-left transition-all ${abaAtiva === "senha" ? "text-[#8C3A29] font-bold translate-x-1" : "opacity-75 hover:opacity-100 hover:translate-x-0.5"}`}>Trocar Senha</button>
                                    <button onClick={() => setAbaAtiva("cookies")} className={`block cursor-pointer text-left transition-all ${abaAtiva === "cookies" ? "text-[#8C3A29] font-bold translate-x-1" : "opacity-75 hover:opacity-100 hover:translate-x-0.5"}`}>Preferências De Cookies</button>
                                    <button onClick={() => setAbaAtiva("privacidade")} className={`block cursor-pointer text-left transition-all ${abaAtiva === "privacidade" ? "text-[#8C3A29] font-bold translate-x-1" : "opacity-75 hover:opacity-100 hover:translate-x-0.5"}`}>Configurações De Privacidade</button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-3 border-t border-[#2C221E]/10">
                                <button onClick={() => setAbaAtiva("compras")} className={`flex cursor-pointer items-center gap-2.5 w-full text-left transition-colors ${abaAtiva === "compras" ? "text-[#8C3A29] font-bold" : "text-[#2C221E] opacity-75 hover:opacity-100"}`}>
                                    <ShoppingBag className="h-4 w-4 text-[#8C3A29]" />
                                    <span>Minhas Compras</span>
                                </button>
                                <button onClick={() => setAbaAtiva("notificacoes")} className={`flex cursor-pointer items-center gap-2.5 w-full text-left transition-colors ${abaAtiva === "notificacoes" ? "text-[#8C3A29] font-bold" : "text-[#2C221E] opacity-75 hover:opacity-100"}`}>
                                    <Bell className="h-4 w-4 text-[#8C3A29]" />
                                    <span>Notificações</span>
                                </button>
                                <button onClick={() => setAbaAtiva("cupons")} className={`flex cursor-pointer items-center gap-2.5 w-full text-left transition-colors ${abaAtiva === "cupons" ? "text-[#8C3A29] font-bold" : "text-[#2C221E] opacity-75 hover:opacity-100"}`}>
                                    <Ticket className="h-4 w-4 text-[#8C3A29]" />
                                    <span>Meus Cupons</span>
                                </button>
                                <button onClick={() => setAbaAtiva("moedas")} className={`flex cursor-pointer items-center gap-2.5 w-full text-left transition-colors ${abaAtiva === "moedas" ? "text-[#8C3A29] font-bold" : "text-[#2C221E] opacity-75 hover:opacity-100"}`}>
                                    <Coins className="h-4 w-4 text-[#C89B51]" />
                                    <span>Minhas Moedas Retrôa</span>
                                </button>
                            </div>
                        </nav>
                    </aside>

                    <section className="bg-[#E5D9C5]/50 backdrop-blur-md p-6 md:p-8 min-h-[550px] border border-[#2C221E]/10 shadow-sm rounded-lg">

                        {abaAtiva === "perfil" && (
                            <div>
                                <div className="flex justify-between items-center pb-5 border-b border-[#2C221E]/10">
                                    <div>
                                        <h2 className="font-serif text-2xl text-[#2C221E]">Meu Perfil</h2>
                                        <p className="text-xs opacity-60 mt-0.5">Gerenciar e proteger sua conta</p>
                                    </div>
                                    {!editando && (
                                        <button onClick={iniciarEdicao} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8C3A29] hover:opacity-75 transition-opacity cursor-pointer">
                                            <Pencil className="h-3.5 w-3.5" /> Editar Perfil
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8 mt-8 items-start">
                                    <div className="space-y-6 text-sm">
                                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                            <span className="text-xs uppercase tracking-wider opacity-50 text-right">E-mail</span>
                                            <div className="flex items-center justify-between border-b border-[#2C221E]/15 py-2">
                                                <span className="opacity-80">{cliente.email}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                            <span className="text-xs uppercase tracking-wider opacity-50 text-right">Nome</span>
                                            {editando ? (
                                                <input value={form.nome} onChange={e => atualizarCampo("nome", e.target.value)} className="border-b border-[#2C221E]/30 bg-transparent py-2 text-sm outline-none focus:border-[#8C3A29]" />
                                            ) : (
                                                <span className="py-2 text-[#2C221E] font-medium">{cliente.nome}</span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                                            <span className="text-xs uppercase tracking-wider opacity-50 text-right">Telefone</span>
                                            {editando ? (
                                                <input value={form.telefone} onChange={e => atualizarCampo("telefone", e.target.value)} placeholder="Seu telefone" className="border-b border-[#2C221E]/30 bg-transparent py-2 text-sm outline-none focus:border-[#8C3A29]" />
                                            ) : (
                                                <span className="py-2 text-[#2C221E]">{cliente.telefone || "Não informado"}</span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-[120px_1fr] items-start gap-4">
                                            <span className="text-xs uppercase tracking-wider opacity-50 text-right pt-2">Endereço</span>
                                            {editando ? (
                                                <textarea value={form.endereco} onChange={e => atualizarCampo("endereco", e.target.value)} rows={3} placeholder="Seu endereço" className="resize-none border-b border-[#2C221E]/30 bg-transparent py-2 text-sm outline-none focus:border-[#8C3A29]" />
                                            ) : (
                                                <span className="py-2 text-[#2C221E] leading-relaxed">{cliente.endereco || "Não informado"}</span>
                                            )}
                                        </div>

                                        {editando && (
                                            <div className="flex gap-4 pt-4 pl-[120px]">
                                                <button onClick={salvarPerfil} disabled={salvando} className="bg-[#3B5249] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#EFE4D3] hover:bg-[#8C3A29] disabled:opacity-50 transition-colors shadow-sm cursor-pointer">
                                                    {salvando ? "Salvando..." : "Salvar"}
                                                </button>
                                                <button onClick={cancelarEdicao} disabled={salvando} className="border border-[#2C221E]/20 px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:border-[#8C3A29] hover:text-[#8C3A29] transition-colors cursor-pointer">
                                                    Cancelar
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-center justify-center p-6 text-center">
                                        <div className="relative inline-block mb-4">
                                            <div className="relative h-44 w-44 rounded-full overflow-hidden shadow-sm">
                                                {cliente.foto_url ? (
                                                    <Image src={cliente.foto_url} alt={cliente.nome} fill unoptimized className="object-cover sepia-[0.15]" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-[#3B5249] font-serif text-3xl text-[#EFE4D3]">
                                                        {iniciais(cliente.nome)}
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => fotoRef.current?.click()}
                                                disabled={enviandoFoto}
                                                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#EFE4D3] border border-[#2C221E]/20 flex items-center justify-center text-[#2C221E] shadow-md hover:bg-[#3B5249] hover:text-[#EFE4D3] hover:border-transparent transition-colors cursor-pointer"
                                                title="Mudar foto"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={selecionarFoto} />

                                        <p className="text-xs font-bold text-[#2C221E]">{cliente.nome}</p>
                                        <p className="mt-1 text-[10px] opacity-50 leading-normal">
                                            {enviandoFoto ? "Fazendo upload da foto..." : "Clique no ícone de lápis para alterar"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {abaAtiva === "cartoes" && (
                            <div>
                                <div className="flex justify-between items-center pb-5 border-b border-[#2C221E]/10">
                                    <div>
                                        <h2 className="font-serif text-2xl text-[#2C221E]">Cartões / Contas Bancárias</h2>
                                        <p className="text-xs opacity-60 mt-0.5">Gerencie seus métodos de pagamento salvos</p>
                                    </div>
                                    <button onClick={() => setModalCartaoAberto(true)} className="bg-[#3B5249] px-4 py-2 text-xs font-bold text-[#EFE4D3] hover:bg-[#8C3A29] transition-colors cursor-pointer rounded">
                                        + Adicionar Novo Cartão
                                    </button>
                                </div>

                                <div className="mt-8 space-y-4">
                                    {cartoes.length === 0 ? (
                                        <p className="text-xs opacity-60 py-8 text-center">Nenhum cartão cadastrado no momento.</p>
                                    ) : (
                                        cartoes.map(cartao => (
                                            <div key={cartao.id} className="border border-[#2C221E]/15 bg-[#EFE4D3] p-5 flex items-center justify-between shadow-sm rounded">
                                                <div className="flex items-center gap-4">
                                                    <CreditCard className="h-8 w-8 text-[#8C3A29]" />
                                                    <div>
                                                        <p className="font-bold text-sm">{cartao.bandeira} {cartao.numero}</p>
                                                        <p className="text-xs opacity-60">Validade: {cartao.validade} • Titular: {cartao.titular}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => excluirCartao(cartao.id)} className="text-xs text-[#8C3A29] font-bold hover:underline cursor-pointer">Excluir</button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {modalCartaoAberto && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                                        <div className="bg-[#EFE4D3] border border-[#2C221E]/20 p-6 w-full max-w-md shadow-lg rounded">
                                            <div className="flex justify-between items-center pb-4 border-b border-[#2C221E]/10">
                                                <h3 className="font-serif text-lg font-bold">Adicionar Novo Cartão</h3>
                                                <button onClick={() => setModalCartaoAberto(false)} className="opacity-60 hover:opacity-15 cursor-pointer"><X className="h-5 w-5" /></button>
                                            </div>
                                            <form onSubmit={adicionarCartao} className="space-y-4 mt-4 text-sm">
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1">Número do Cartão</label>
                                                    <input type="text" maxLength={16} placeholder="0000 0000 0000 0000" value={novoCartao.numero} onChange={e => setNovoCartao({ ...novoCartao, numero: e.target.value })} className="w-full border-b border-[#2C221E]/30 bg-transparent py-2 outline-none focus:border-[#8C3A29]" required />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1">Nome do Titular</label>
                                                    <input type="text" placeholder="Como no cartão" value={novoCartao.titular} onChange={e => setNovoCartao({ ...novoCartao, titular: e.target.value })} className="w-full border-b border-[#2C221E]/30 bg-transparent py-2 outline-none focus:border-[#8C3A29]" required />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1">Validade</label>
                                                        <input type="text" placeholder="MM/AA" maxLength={5} value={novoCartao.validade} onChange={e => setNovoCartao({ ...novoCartao, validade: e.target.value })} className="w-full border-b border-[#2C221E]/30 bg-transparent py-2 outline-none focus:border-[#8C3A29]" required />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1">CVV</label>
                                                        <input type="password" maxLength={4} placeholder="123" value={novoCartao.cvv} onChange={e => setNovoCartao({ ...novoCartao, cvv: e.target.value })} className="w-full border-b border-[#2C221E]/30 bg-transparent py-2 outline-none focus:border-[#8C3A29]" required />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-3 pt-4">
                                                    <button type="button" onClick={() => setModalCartaoAberto(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-[#2C221E]/20 hover:border-[#8C3A29]">Cancelar</button>
                                                    <button type="submit" className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#3B5249] text-[#EFE4D3] hover:bg-[#8C3A29]">Salvar Cartão</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {abaAtiva === "enderecos" && (
                            <div>
                                <div className="flex justify-between items-center pb-5 border-b border-[#2C221E]/10">
                                    <div>
                                        <h2 className="font-serif text-2xl text-[#2C221E]">Endereços de Entrega</h2>
                                        <p className="text-xs opacity-60 mt-0.5">Gerencie os locais onde você recebe suas peças</p>
                                    </div>
                                    <button onClick={() => setAbaAtiva("perfil")} className="bg-[#3B5249] px-4 py-2 text-xs font-bold text-[#EFE4D3] hover:bg-[#8C3A29] transition-colors cursor-pointer rounded">
                                        Editar no Perfil
                                    </button>
                                </div>
                                <div className="mt-8 border border-[#2C221E]/15 bg-[#EFE4D3] p-5 shadow-sm rounded">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-[#3B5249]/10 rounded-full">
                                            <User className="h-5 w-5 text-[#8C3A29]" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{cliente.nome} <span className="font-normal opacity-65 ml-2">{cliente.telefone || "Sem telefone"}</span></p>
                                            <p className="text-xs opacity-80 mt-1 leading-relaxed">{cliente.endereco || "Nenhum endereço cadastrado ainda."}</p>
                                            <span className="inline-block mt-3 px-2.5 py-0.5 text-[10px] font-bold bg-[#3B5249] text-[#EFE4D3]">Endereço Padrão</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {abaAtiva === "senha" && (
                            <div>
                                <div className="pb-5 border-b border-[#2C221E]/10">
                                    <h2 className="font-serif text-2xl text-[#2C221E]">Trocar Senha</h2>
                                    <p className="text-xs opacity-60 mt-0.5">Para sua segurança, confirme sua identidade antes de alterar</p>
                                </div>

                                <div className="mt-8 max-w-md space-y-6 text-sm">
                                    <div className="bg-[#EFE4D3] border border-[#2C221E]/15 p-6 shadow-sm rounded text-center space-y-4">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-[#3B5249]/10 flex items-center justify-center text-[#8C3A29]">
                                            <ShieldCheck className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Verificar Identidade</p>
                                            <p className="text-xs opacity-60 mt-1">
                                                Para alterar sua senha, enviaremos um link de confirmação para o seu e-mail cadastrado (<strong className="opacity-90">{cliente.email}</strong>).
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => alert(`Link de verificação enviado com sucesso para ${cliente.email}! Verifique sua caixa de entrada.`)}
                                            className="w-full bg-[#3B5249] py-2.5 text-xs font-bold uppercase tracking-wider text-[#EFE4D3] hover:bg-[#8C3A29] transition-colors shadow-sm cursor-pointer rounded"
                                        >
                                            Verificar via link por E-mail
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {abaAtiva === "cookies" && (
                            <div>
                                <div className="pb-5 border-b border-[#2C221E]/10">
                                    <h2 className="font-serif text-2xl text-[#2C221E]">Preferências De Cookies</h2>
                                    <p className="text-xs opacity-60 mt-0.5">Escolha quais cookies você permite que o Retrôa utilize</p>
                                </div>
                                <div className="mt-8 space-y-6 text-sm">
                                    {/* Cookie Essencial */}
                                    <div className="flex items-center justify-between border-b border-[#2C221E]/10 pb-4">
                                        <div>
                                            <p className="font-bold">Cookies Essenciais</p>
                                            <p className="text-xs opacity-60">Necessários para o funcionamento básico do site e login.</p>
                                        </div>
                                        <div className="w-11 h-6 bg-[#3B5249] rounded-full p-1 opacity-60 cursor-not-allowed">
                                            <div className="w-4 h-4 bg-[#EFE4D3] rounded-full translate-x-5"></div>
                                        </div>
                                    </div>

                                    {/* Cookie Analítico (Toggle Estilizado com bolinha) */}
                                    <div className="flex items-center justify-between border-b border-[#2C221E]/10 pb-4">
                                        <div>
                                            <p className="font-bold">Cookies Analíticos</p>
                                            <p className="text-xs opacity-60">Nos ajudam a entender como você navega pelas peças antigas.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCookieConfig({ ...cookieConfig, analiticos: !cookieConfig.analiticos })}
                                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${cookieConfig.analiticos ? "bg-[#3B5249]" : "bg-[#2C221E]/30"}`}
                                        >
                                            <div className={`w-4 h-4 bg-[#EFE4D3] rounded-full transition-transform ${cookieConfig.analiticos ? "translate-x-5" : "translate-x-0"}`}></div>
                                        </button>
                                    </div>

                                    {/* Cookie Marketing (Toggle Estilizado com bolinha) */}
                                    <div className="flex items-center justify-between pb-4">
                                        <div>
                                            <p className="font-bold">Cookies de Marketing</p>
                                            <p className="text-xs opacity-60">Utilizados para exibir anúncios relevantes de novos achados.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCookieConfig({ ...cookieConfig, marketing: !cookieConfig.marketing })}
                                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${cookieConfig.marketing ? "bg-[#3B5249]" : "bg-[#2C221E]/30"}`}
                                        >
                                            <div className={`w-4 h-4 bg-[#EFE4D3] rounded-full transition-transform ${cookieConfig.marketing ? "translate-x-5" : "translate-x-0"}`}></div>
                                        </button>
                                    </div>

                                    <button onClick={() => alert("Preferências de cookies salvas com sucesso!")} className="bg-[#3B5249] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#EFE4D3] hover:bg-[#8C3A29] transition-colors shadow-sm cursor-pointer rounded">
                                        Salvar Preferências
                                    </button>
                                </div>
                            </div>
                        )}

                        {abaAtiva === "privacidade" && (
                            <div>
                                <div className="pb-5 border-b border-[#2C221E]/10">
                                    <h2 className="font-serif text-2xl text-[#2C221E]">Configurações De Privacidade</h2>
                                    <p className="text-xs opacity-60 mt-0.5">Controle o uso e a visibilidade dos seus dados pessoais</p>
                                </div>
                                <div className="mt-8 space-y-6 text-sm">
                                    <div className="flex items-center gap-3 bg-[#3B5249]/5 p-4 border border-[#3B5249]/10 rounded">
                                        <ShieldCheck className="h-6 w-6 text-[#3B5249]" />
                                        <div>
                                            <p className="font-bold">Proteção de Dados LGPD</p>
                                            <p className="text-xs opacity-60">Seus dados estão protegidos conforme as normas vigentes no Brasil.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold">Perfil público no acervo</p>
                                                <p className="text-xs opacity-60">Permitir que outros colecionadores vejam suas avaliações.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPrivacidadeConfig({ ...privacidadeConfig, perfilPublico: !privacidadeConfig.perfilPublico })}
                                                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${privacidadeConfig.perfilPublico ? "bg-[#3B5249]" : "bg-[#2C221E]/30"}`}
                                            >
                                                <div className={`w-4 h-4 bg-[#EFE4D3] rounded-full transition-transform ${privacidadeConfig.perfilPublico ? "translate-x-5" : "translate-x-0"}`}></div>
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold">Compartilhar dados com parceiros de frete</p>
                                                <p className="text-xs opacity-60">Necessário para agilizar entregas dos Correios/Transportadoras.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setPrivacidadeConfig({ ...privacidadeConfig, compartilharDadosParceiros: !privacidadeConfig.compartilharDadosParceiros })}
                                                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${privacidadeConfig.compartilharDadosParceiros ? "bg-[#3B5249]" : "bg-[#2C221E]/30"}`}
                                            >
                                                <div className={`w-4 h-4 bg-[#EFE4D3] rounded-full transition-transform ${privacidadeConfig.compartilharDadosParceiros ? "translate-x-5" : "translate-x-0"}`}></div>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[#2C221E]/10 flex flex-col gap-3">
                                        <button onClick={() => alert("Solicitação de download de dados enviada para seu e-mail.")} className="text-left font-bold text-xs text-[#8C3A29] hover:underline cursor-pointer">
                                            Solicitar cópia dos meus dados pessoais
                                        </button>
                                        <button onClick={() => confirm("Deseja realmente solicitar a desativação da sua conta?") && alert("Solicitação de exclusão enviada.")} className="text-left font-bold text-xs text-red-700 hover:underline cursor-pointer">
                                            Solicitar exclusão da conta
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {abaAtiva === "compras" && (
                            <div>
                                {!pedidoSelecionadoAndamento ? (
                                    <>
                                        <div className="flex border-b border-[#2C221E]/15 overflow-x-auto text-xs font-medium">
                                            {[
                                                { id: "todos", label: "Tudo" },
                                                { id: "pendente", label: "A Pagar" },
                                                { id: "processando", label: "Preparando" },
                                                { id: "enviado", label: "A caminho" },
                                                { id: "entregue", label: "Finalizado" },
                                                { id: "cancelado", label: "Cancelado" }
                                            ].map(aba => (
                                                <button
                                                    key={aba.id}
                                                    onClick={() => setFiltroStatus(aba.id)}
                                                    className={`py-3 px-4 whitespace-nowrap transition-colors border-b-2 cursor-pointer ${filtroStatus === aba.id ? "border-[#8C3A29] text-[#8C3A29] font-bold" : "border-transparent opacity-60 hover:opacity-100"}`}
                                                >
                                                    {aba.label}
                                                </button>
                                            ))}
                                        </div>

                                        {compras.length > 0 && (
                                            <div className="flex justify-between items-center my-6 text-xs">
                                                <button onClick={selecionarTodos} className="font-bold uppercase tracking-wider opacity-60 hover:text-[#8C3A29] cursor-pointer">
                                                    {selecionados.length === comprasFiltradas.length && comprasFiltradas.length > 0 ? "Desmarcar todos" : "Selecionar todos"}
                                                </button>
                                                {selecionados.length > 0 && (
                                                    <button onClick={excluirSelecionados} className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#8C3A29] hover:opacity-75 cursor-pointer">
                                                        <Trash2 className="h-3.5 w-3.5" /> Excluir selecionados ({selecionados.length})
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {!comprasFiltradas.length ? (
                                            <div className="py-20 text-center">
                                                <ShoppingBag className="mx-auto h-10 w-10 opacity-20 text-[#2C221E]" />
                                                <h3 className="mt-4 font-serif text-xl text-[#2C221E]">Nenhum pedido encontrado</h3>
                                                <p className="mt-1 text-xs opacity-50">Não há registros para este filtro no momento.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 mt-4">
                                                {comprasFiltradas.map(pedido => {
                                                    const st = statusNormalizado(pedido.status);
                                                    const selecionado = selecionados.includes(pedido.id);

                                                    return (
                                                        <article key={pedido.id} className={`border border-[#2C221E]/10 bg-[#EFE4D3] p-5 transition-all shadow-sm hover:border-[#3B5249] rounded ${selecionado ? "ring-1 ring-[#3B5249]" : ""}`}>
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#2C221E]/10 text-xs">
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={() => alternarPedido(pedido.id)}
                                                                        className={`flex h-4 w-4 items-center justify-center border transition-colors cursor-pointer ${selecionado ? "border-[#3B5249] bg-[#3B5249] text-[#EFE4D3]" : "border-[#2C221E]/30 hover:border-[#8C3A29]"}`}
                                                                        aria-label="Selecionar pedido"
                                                                    >
                                                                        {selecionado && <Check className="h-3 w-3" />}
                                                                    </button>
                                                                    <span className="font-bold text-sm">Pedido #{pedido.id}</span>
                                                                    <span className="opacity-40">|</span>
                                                                    <span className="opacity-60">{data(pedido.data || pedido.created_at)}</span>
                                                                </div>
                                                                <div>
                                                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${st === "cancelado" ? "bg-[#E8D4D0] text-[#8C3A29]" : "bg-[#D7E2DE] text-[#3B5249]"}`}>
                                                                        {st === "processando" ? "Preparando" : st === "enviado" ? "A caminho" : st === "entregue" ? "Finalizado" : st === "cancelado" ? "Cancelado" : "Pendente"}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                                <div className="flex items-start gap-3">
                                                                    <div className="h-10 w-10 bg-[#DFD3BE] flex items-center justify-center shrink-0 rounded">
                                                                        <Package className="h-5 w-5 text-[#8C3A29]" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-serif text-sm font-bold text-[#2C221E]">Itens do acervo Retrôa</p>
                                                                        <p className="text-xs opacity-60 line-clamp-1 mt-0.5">{pedido.itens || "Detalhes indisponíveis"}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="text-[10px] opacity-50 mr-2">Total:</span>
                                                                    <span className="font-serif text-base font-bold text-[#2C221E]">{preco(pedido.total)}</span>
                                                                </div>
                                                            </div>

                                                            <div className="pt-3 border-t border-[#2C221E]/10 flex justify-between items-center">
                                                                <span className="text-xs opacity-50">Código: <strong className="font-mono">{pedido.codigo_rastreio || "RETROA2026BR"}</strong></span>
                                                                <button
                                                                    onClick={() => setPedidoAndamentoId(pedido.id)}
                                                                    className="bg-[#3B5249] text-[#EFE4D3] px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#8C3A29] transition-colors shadow-sm cursor-pointer rounded"
                                                                >
                                                                    Ver Andamento <ChevronRight className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </article>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    (() => {
                                        const p = pedidoSelecionadoAndamento;
                                        const st = statusNormalizado(p.status);

                                        const passos = [
                                            { key: "pendente", label: "Pedido Realizado", sub: data(p.data || p.created_at) },
                                            { key: "processando", label: "Preparando", sub: data(p.data || p.created_at) },
                                            { key: "enviado", label: "A caminho", sub: data(p.data || p.created_at) },
                                            { key: "entregue", label: "Finalizado", sub: data(p.data || p.created_at) }
                                        ];

                                        const ordemStatus: Record<Status, number> = {
                                            pendente: 0,
                                            processando: 1,
                                            enviado: 2,
                                            entregue: 3,
                                            cancelado: -1
                                        };
                                        const indiceAtual = st === "cancelado" ? -1 : ordemStatus[st];

                                        return (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between pb-4 border-b border-[#2C221E]/10">
                                                    <button
                                                        onClick={() => setPedidoAndamentoId(null)}
                                                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3B5249] hover:text-[#8C3A29] transition-colors cursor-pointer"
                                                    >
                                                        <ArrowLeft className="h-4 w-4" /> Voltar para lista de pedidos
                                                    </button>
                                                    <span className="text-xs font-bold uppercase tracking-wider text-[#8C3A29]">
                                                        PEDIDO ID. {p.id}
                                                    </span>
                                                </div>

                                                <div className="bg-[#EFE4D3] border border-[#2C221E]/15 p-6 md:p-8 shadow-sm rounded">
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-[#2C221E]/10 gap-2">
                                                        <span className="font-serif text-lg font-bold text-[#2C221E]">Andamento do Pedido #{p.id}</span>
                                                        <span className="text-xs font-bold uppercase tracking-wider text-[#3B5249] bg-[#D7E2DE] px-3 py-1">
                                                            {st === "entregue" ? "Finalizado" : st === "enviado" ? "A caminho" : st === "processando" ? "Preparando" : st === "cancelado" ? "Cancelado" : "Pendente"}
                                                        </span>
                                                    </div>

                                                    <div className="py-10 px-2 overflow-x-auto">
                                                        <div className="min-w-[600px] flex items-center justify-between relative px-8">
                                                            <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-1 bg-[#2C221E]/15 z-0" />

                                                            {passos.map((passo, idx) => {
                                                                const concluido = idx <= indiceAtual;

                                                                return (
                                                                    <div key={passo.key} className="relative z-10 flex flex-col items-center text-center">
                                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${concluido ? "bg-[#3B5249] text-[#EFE4D3] shadow-md" : "bg-[#DFD3BE] text-[#2C221E]/30 border border-[#2C221E]/20"}`}>
                                                                            {concluido ? <Check className="h-5 w-5" /> : <Clock className="h-4 w-4" />}
                                                                        </div>
                                                                        <span className={`mt-3 text-xs font-bold ${concluido ? "text-[#2C221E]" : "opacity-40"}`}>
                                                                            {passo.label}
                                                                        </span>
                                                                        <span className="mt-0.5 text-[10px] opacity-50">
                                                                            {passo.sub}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-[#2C221E]/10 flex flex-col md:flex-row justify-between items-center gap-4">
                                                        <div className="flex gap-3 w-full md:w-auto">
                                                            <button onClick={() => alert("Redirecionando para chat com o vendedor...")} className="flex-1 md:flex-initial border border-[#2C221E]/30 px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#3B5249] hover:text-[#EFE4D3] transition-colors cursor-pointer rounded">
                                                                Contatar Vendedor
                                                            </button>
                                                            <button onClick={() => alert("Adicionando itens novamente ao carrinho...")} className="flex-1 md:flex-initial bg-[#8C3A29] text-[#EFE4D3] px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#732D20] transition-colors cursor-pointer rounded">
                                                                Comprar Novamente
                                                            </button>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-xs opacity-60 mr-2">Valor Total:</span>
                                                            <span className="font-serif text-lg font-bold text-[#2C221E]">{preco(p.total)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="bg-[#EFE4D3] border border-[#2C221E]/15 p-5 shadow-sm rounded">
                                                        <p className="font-bold text-xs uppercase tracking-wider opacity-60 mb-3">Endereço de Entrega</p>
                                                        <p className="font-bold text-sm">{cliente.nome}</p>
                                                        <p className="text-xs opacity-80 mt-1 leading-relaxed">{cliente.endereco || "Endereço principal cadastrado na conta."}</p>
                                                        <p className="text-xs opacity-60 mt-2">{cliente.telefone || "(11) 99999-9999"}</p>
                                                    </div>

                                                    <div className="bg-[#EFE4D3] border border-[#2C221E]/15 p-5 shadow-sm flex flex-col justify-between rounded">
                                                        <div>
                                                            <div className="flex justify-between items-center mb-3">
                                                                <p className="font-bold text-xs uppercase tracking-wider opacity-60">Código de Rastreio</p>
                                                                <span className="bg-[#8C3A29] text-[#EFE4D3] px-2.5 py-1 font-mono font-bold text-xs rounded">
                                                                    {p.codigo_rastreio || "RETROA2026BR"}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-3 pt-3 border-t border-[#2C221E]/10 text-xs">
                                                                <div className="flex items-start gap-2">
                                                                    <div className="w-2 h-2 rounded-full bg-[#3B5249] mt-1 shrink-0" />
                                                                    <div>
                                                                        <p className="font-bold text-[#3B5249]">Finalizado</p>
                                                                        <p className="opacity-70 text-[11px]">Sua encomenda foi entregue com sucesso ao destinatário.</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-start gap-2 opacity-70">
                                                                    <div className="w-2 h-2 rounded-full bg-[#2C221E]/40 mt-1 shrink-0" />
                                                                    <div>
                                                                        <p className="font-bold">A caminho</p>
                                                                        <p className="text-[11px]">Empresa de transporte encaminhando o pacote.</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-[10px] opacity-50 mt-4 italic">Detalhes do item: {p.itens || "Peças exclusivas selecionadas"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        )}

                        {abaAtiva === "notificacoes" && (
                            <div>
                                <div className="pb-5 border-b border-[#2C221E]/10">
                                    <h2 className="font-serif text-2xl text-[#2C221E]">Notificações</h2>
                                    <p className="text-xs opacity-60 mt-0.5">Escolha como deseja receber avisos sobre seus pedidos e novos achados</p>
                                </div>
                                <div className="mt-8 space-y-6 text-sm">
                                    <div className="flex items-center justify-between border-b border-[#2C221E]/10 pb-4">
                                        <div>
                                            <p className="font-bold">Notificações por E-mail</p>
                                            <p className="text-xs opacity-60">Receba atualizações de status de entrega direto no seu e-mail.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNotifConfig({ ...notifConfig, email: !notifConfig.email })}
                                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${notifConfig.email ? "bg-[#3B5249]" : "bg-[#2C221E]/30"}`}
                                        >
                                            <div className={`w-4 h-4 bg-[#EFE4D3] rounded-full transition-transform ${notifConfig.email ? "translate-x-5" : "translate-x-0"}`}></div>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-[#2C221E]/10 pb-4">
                                        <div>
                                            <p className="font-bold">Alertas via WhatsApp</p>
                                            <p className="text-xs opacity-60">Mensagens rápidas quando seu pedido for postado.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNotifConfig({ ...notifConfig, whatsapp: !notifConfig.whatsapp })}
                                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${notifConfig.whatsapp ? "bg-[#3B5249]" : "bg-[#2C221E]/30"}`}
                                        >
                                            <div className={`w-4 h-4 bg-[#EFE4D3] rounded-full transition-transform ${notifConfig.whatsapp ? "translate-x-5" : "translate-x-0"}`}></div>
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between pb-4">
                                        <div>
                                            <p className="font-bold">Novidades e Promoções do Acervo</p>
                                            <p className="text-xs opacity-60">Fique sabendo em primeira mão quando novas peças raras chegarem.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setNotifConfig({ ...notifConfig, promocoes: !notifConfig.promocoes })}
                                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${notifConfig.promocoes ? "bg-[#3B5249]" : "bg-[#2C221E]/30"}`}
                                        >
                                            <div className={`w-4 h-4 bg-[#EFE4D3] rounded-full transition-transform ${notifConfig.promocoes ? "translate-x-5" : "translate-x-0"}`}></div>
                                        </button>
                                    </div>
                                    <button onClick={() => alert("Configurações de notificações salvas!")} className="bg-[#3B5249] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#EFE4D3] hover:bg-[#8C3A29] transition-colors shadow-sm cursor-pointer rounded">
                                        Salvar Alterações
                                    </button>
                                </div>
                            </div>
                        )}

                        {abaAtiva === "cupons" && (
                            <div>
                                <div className="flex justify-between items-center pb-5 border-b border-[#2C221E]/10">
                                    <div>
                                        <h2 className="font-serif text-2xl text-[#2C221E]">Meus Cupons</h2>
                                        <p className="text-xs opacity-60 mt-0.5">Resgate e utilize descontos especiais no acervo</p>
                                    </div>
                                </div>
                                <div className="mt-8 flex gap-3">
                                    <input type="text" placeholder="Insira o código do cupom aqui" className="border-b border-[#2C221E]/30 bg-transparent py-2 text-sm flex-1 outline-none focus:border-[#8C3A29]" />
                                    <button onClick={() => alert("Cupom inválido ou expirado.")} className="bg-[#3B5249] px-6 py-2 text-xs font-bold text-[#EFE4D3] hover:bg-[#8C3A29] transition-colors shadow-sm cursor-pointer rounded">
                                        Resgatar
                                    </button>
                                </div>
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border border-[#2C221E]/15 bg-[#EFE4D3] p-4 flex flex-col justify-between shadow-sm rounded">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#8C3A29] text-[#EFE4D3] px-2 py-0.5 rounded">Especial</span>
                                            <p className="font-serif text-lg font-bold mt-2">R$ 30 OFF</p>
                                            <p className="text-xs opacity-60 mt-1">Para compras acima de R$ 150 em peças antigas.</p>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-[#2C221E]/10 flex justify-between items-center text-xs">
                                            <span className="opacity-50">Válido até 30/09/2026</span>
                                            <button onClick={() => alert("Cupom copiado!")} className="text-[#8C3A29] font-bold hover:underline cursor-pointer">Usar</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {abaAtiva === "moedas" && (
                            <div>
                                <div className="pb-5 border-b border-[#2C221E]/10">
                                    <h2 className="font-serif text-2xl text-[#2C221E]">Minhas Moedas Retrôa</h2>
                                    <p className="text-xs opacity-60 mt-0.5">Acumule moedas a cada compra e troque por descontos</p>
                                </div>
                                <div className="mt-8 p-6 bg-[#3B5249] text-[#EFE4D3] flex items-center justify-between shadow-md rounded">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider opacity-75">Saldo Total</p>
                                        <p className="font-serif text-4xl font-bold mt-1 text-[#C89B51]">350 Moedas</p>
                                        <p className="text-xs opacity-70 mt-2">Equivalente a R$ 35,00 de desconto no acervo.</p>
                                    </div>
                                    <Coins className="h-16 w-16 text-[#C89B51] opacity-80" />
                                </div>
                                <div className="mt-8">
                                    <p className="text-xs uppercase tracking-wider font-bold opacity-50 mb-4">Histórico de Moedas</p>
                                    <div className="space-y-3 text-xs">
                                        <div className="flex justify-between border-b border-[#2C221E]/10 pb-3">
                                            <div>
                                                <p className="font-bold">Compra realizada (Pedido #104)</p>
                                                <p className="opacity-50 mt-0.5">02/09/2026</p>
                                            </div>
                                            <span className="text-[#3B5249] font-bold">+50 moedas</span>
                                        </div>
                                        <div className="flex justify-between border-b border-[#2C221E]/10 pb-3">
                                            <div>
                                                <p className="font-bold">Bônus de Cadastro</p>
                                                <p className="opacity-50 mt-0.5">01/09/2026</p>
                                            </div>
                                            <span className="text-[#3B5249] font-bold">+300 moedas</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </section>
                </div>
            </div>

            <footer className="relative z-10 mt-20 border-t border-[#2C221E]/10 bg-[#3B5249] px-6 text-[#EFE4D3] md:px-10">
                <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6 text-xs opacity-75">
                    <div className="flex items-center gap-3">
                        <Image src="/logotransp2.png" alt="Retrôa" width={100} height={100} className="h-auto-auto object-contain brightness-0 invert opacity-75" />
                        <span>© {new Date().getFullYear()} Retrôa. Todos os direitos reservados.</span>
                    </div>
                    <span>Peças antigas. Novas histórias.</span>
                </div>
            </footer>
        </main>
    );
}