"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  X,
  Check,
  ShieldCheck,
  Truck,
  User,
  ArrowLeft,
  Compass,
  Sparkles,
  HeartHandshake,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PRODUTOS_MOCK = [
  {
    id: "1",
    nome: "Vaso de cerâmica artesanal marajoara",
    categoria: "Cerâmica",
    origem: "Santarém, PA",
    preco: 480.0,
    ano: "1965",
    tag: "Peça Única",
    descricao:
      "Vaso em cerâmica artesanal com grafismos geométricos tradicionais feitos à mão. Acabamento natural em tom terracota.",
    imagem: "/vaso.png",
  },
  {
    id: "2",
    nome: "Máquina de escrever Remington vintage",
    categoria: "Escritório",
    origem: "São Paulo, SP",
    preco: 950.0,
    ano: "1948",
    tag: "Revisada",
    descricao:
      "Máquina de escrever portátil em estrutura metálica preta com pátina do tempo. Mecanismo de teclas preservado.",
    imagem: "/maquinaEscrever.png",
  },
  {
    id: "3",
    nome: "Abajur de mesa em latão e cúpula de vidro",
    categoria: "Iluminação",
    origem: "Petrópolis, RJ",
    preco: 720.0,
    ano: "1955",
    tag: "Funcionando",
    descricao:
      "Luminária de mesa estilo banqueiro com corpo tubular em latão e cúpula cônica em vidro âmbar transpassado.",
    imagem: "/abajur.png",
  },
  {
    id: "4",
    nome: "Rádio de mesa em caixa de madeira nobre",
    categoria: "Música",
    origem: "Curitiba, PR",
    preco: 1280.0,
    ano: "1958",
    tag: "Relíquia",
    descricao:
      "Rádio AM/FM vintage em gabinete de madeira trabalhada com botões seletores e mostrador analógico iluminado.",
    imagem: "/radio.png",
  },
  {
    id: "5",
    nome: "Espelho de parede com moldura dourada entalhada",
    categoria: "Decoração",
    origem: "Ouro Preto, MG",
    preco: 1150.0,
    ano: "1930",
    tag: "Raro",
    descricao:
      "Espelho clássico retangular com moldura entalhada em gesso e acabamento em folha de ouro envelhecida.",
    imagem: "/espelho.png",
  },
  {
    id: "6",
    nome: "Poltrona em madeira nobre e palhinha indiana",
    categoria: "Casa",
    origem: "Pelotas, RS",
    preco: 2100.0,
    ano: "1962",
    tag: "Achado",
    descricao:
      "Poltrona com estrutura em jacarandá maciço, braços anatômicos e encosto/assento em palhinha trançada natural.",
    imagem: "/cadeira.png",
  },
];

const CATEGORIAS = [
  "Todas",
  "Cerâmica",
  "Escritório",
  "Iluminação",
  "Música",
  "Decoração",
  "Casa",
];

export default function Home() {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [usuario, setUsuario] = useState<any>(null);

  const [carrinho, setCarrinho] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const salvo = localStorage.getItem("retroa_carrinho");
      return salvo ? JSON.parse(salvo) : [];
    }
    return [];
  });

  const [produtoSelecionado, setProdutoSelecionado] = useState<any | null>(
    null,
  );

  useEffect(() => {
    const sessaoAtiva = localStorage.getItem("retroa_sessao");
    if (sessaoAtiva) setUsuario(JSON.parse(sessaoAtiva));
  }, []);

  useEffect(() => {
    localStorage.setItem("retroa_carrinho", JSON.stringify(carrinho));
  }, [carrinho]);

  const produtosFiltrados = PRODUTOS_MOCK.filter((p) => {
    const atendeCategoria =
      categoriaAtiva === "Todas" || p.categoria === categoriaAtiva;
    const atendeBusca =
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.origem.toLowerCase().includes(busca.toLowerCase());
    return atendeCategoria && atendeBusca;
  });

  const adicionarAoCarrinho = (id: string) =>
    setCarrinho((prev) => [...prev, id]);

  const formatarPreco = (valor: number) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,400&display=swap');
        .font-vintage { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

      <div className="min-h-screen bg-[#F4EFE6] text-[#2C221E] font-sans antialiased relative">
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
                placeholder="Buscar por peça, origem..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full bg-[#EADFD0] text-xs text-[#2C221E] placeholder-[#5F4E44] pl-9 pr-4 py-2 rounded-full border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
              />
              <Search className="w-4 h-4 text-[#5F4E44] absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-6 text-xs font-semibold tracking-wider uppercase text-[#5F4E44]">
              <a
                href="#produtos"
                className="hover:text-[#2C221E] transition-colors"
              >
                Produtos
              </a>
              <a
                href="#sobre"
                className="hover:text-[#2C221E] transition-colors"
              >
                Sobre
              </a>

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
                <Link
                  href="/perfil"
                  className="flex items-center gap-2 hover:text-[#2C221E] transition-colors"
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden bg-[#C85A32] text-white flex items-center justify-center font-bold text-[11px] uppercase shrink-0">
                    {usuario.foto_url ? (
                      <Image
                        src={usuario.foto_url}
                        alt={usuario.nome || "Perfil"}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <span>{usuario.nome ? usuario.nome.charAt(0) : "U"}</span>
                    )}
                  </div>
                  <span className="max-w-[100px] truncate">
                    {usuario.nome ? usuario.nome.split(" ")[0] : "Perfil"}
                  </span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 hover:text-[#2C221E] transition-colors"
                >
                  <User className="w-4 h-4 text-[#C85A32]" />
                  <span>Entrar</span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* HEADER / HERO */}
        <header className="relative w-full min-h-[420px] flex items-center overflow-hidden bg-[#1A1412]">
          <div className="absolute inset-0 z-0 flex items-center justify-end overflow-hidden">
            <div className="relative w-[130%] h-full">
              <Image
                src="/image2.png"
                alt="Acervo Retrôa"
                fill
                className="object-contain object-right"
                priority
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-r from-[#F4EFE6] via-[#F4EFE6]/90 to-transparent w-full"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#F4EFE6] via-transparent to-[#F4EFE6]/30"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full">
            <div className="max-w-xl space-y-4">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-[#b83501]">
                Loja de Antiguidades
              </span>
              <h1 className="font-vintage text-4xl md:text-5xl font-medium leading-[1.1] text-[#2C221E]">
                Objetos com{" "}
                <span className="italic font-normal">história e memória</span>.
              </h1>
              <p className="text-sm text-[#4A3E37] leading-relaxed max-w-md">
                Peças únicas por todo o Brasil, que mostram um pouco do passado
                e a originalidade do tempo.
              </p>
            </div>
          </div>
        </header>

        {/* CATALOGO DE PRODUTOS */}
        <section
          id="produtos"
          className="max-w-7xl mx-auto px-6 py-16 scroll-mt-20"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#2C221E]/10 pb-4 mb-8 gap-4">
            <div>
              <h2 className="font-vintage text-3xl font-medium text-[#2C221E]">
                Catálogo
              </h2>
              <p className="text-xs text-[#5F4E44] mt-1">
                {produtosFiltrados.length} itens disponíveis para compra
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
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
          </div>

          {produtosFiltrados.length === 0 ? (
            <div className="text-center py-16 text-[#5F4E44]">
              <p className="text-lg font-vintage">Nenhuma peça encontrada.</p>
              <button
                onClick={() => {
                  setBusca("");
                  setCategoriaAtiva("Todas");
                }}
                className="mt-2 text-xs text-[#C85A32] underline underline-offset-4"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {produtosFiltrados.map((item) => (
                <div
                  key={item.id}
                  className="group block bg-[#EAE3D2]/30 rounded-lg p-3 border border-[#2C221E]/5 hover:border-[#2C221E]/20 transition-all"
                >
                  <div
                    onClick={() => setProdutoSelecionado(item)}
                    className="relative w-full h-[280px] rounded overflow-hidden mb-3 bg-[#EADFD0] cursor-pointer"
                  >
                    <Image
                      src={item.imagem}
                      alt={item.nome}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute top-3 left-3 bg-[#2C221E]/80 text-[#F4EFE6] text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded">
                      {item.tag}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-[#F4EFE6]/90 text-[#2C221E] text-xs font-mono px-2 py-1 rounded">
                      {item.ano}
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    <p className="text-[10px] uppercase font-semibold tracking-wider text-[#C85A32]">
                      {item.categoria} • {item.origem}
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
                    onClick={() => adicionarAoCarrinho(item.id)}
                    className="w-full bg-[#2C221E] cursor-pointer text-[#F4EFE6] text-xs font-semibold uppercase tracking-wider py-2.5 rounded hover:bg-[#C85A32] transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Adicionar à Sacola
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/produtos"
              className="inline-flex items-center gap-2 border border-[#2C221E]/20 text-[#2C221E] text-xs font-semibold uppercase tracking-wider px-6 py-3 rounded-md hover:bg-[#2C221E] hover:text-[#F4EFE6] transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              Ver Catálogo Completo
            </Link>
          </div>
        </section>

        {/* SEÇÃO SOBRE (INCORPORADA) */}
        <section
          id="sobre"
          className="relative max-w-7xl mx-auto px-6 py-20 border-t border-[#2C221E]/10 scroll-mt-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-[#C85A32] bg-[#C85A32]/10 px-3 py-1 rounded-full border border-[#C85A32]/20">
                Nossa História
              </span>
              <h2 className="font-vintage text-4xl sm:text-5xl font-medium leading-[1.15] text-[#2C221E]">
                Resgatamos objetos que guardam a{" "}
                <span className="italic font-normal text-[#C85A32]">
                  alma do tempo
                </span>
                .
              </h2>
              <p className="text-sm sm:text-base text-[#5F4E44] leading-relaxed font-light">
                A Retrôa nasceu do fascínio pelas memórias contidas em cada
                textura, marca e pátina. Acreditamos que relíquias e
                antiguidades não são apenas itens de decoração, mas fragmentos
                vivos da história e da arte que merecem continuar seu ciclo.
              </p>
              <p className="text-sm sm:text-base text-[#5F4E44] leading-relaxed font-light">
                Cada peça do nosso acervo é garimpada individualmente em
                diferentes cantos do Brasil, passando por um minucioso processo
                de conservação que respeita sua originalidade.
              </p>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative w-full h-[450px] sm:h-[520px] overflow-hidden shadow-2xl border-4 border-[#7F5E39]/40 bg-[#1A0E08] p-2 rounded-lg">
                <div className="relative w-full h-full border border-[#7F5E39]/60 rounded-sm overflow-hidden">
                  <Image
                    src="/sobre.png"
                    alt="Acervo de antiguidades da Retrôa"
                    fill
                    className="object-cover sepia-[0.2]"
                  />
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 bg-[#2C221E] text-[#F4EFE6] p-5 hidden sm:block max-w-xs shadow-2xl border border-[#7F5E39] rounded">
                <p className="font-vintage italic text-sm leading-snug">
                  "O tempo não desgasta a beleza, apenas a torna única e
                  irrepetível."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECAO COMO TRABALHAMOS */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 z-0">
            <Image
              src="/fundoverde.png"
              alt="Estampa Retrôa"
              fill
              className="object-cover brightness-75 saturate-[1.6]"
              priority
            />
          </div>
          {/* Sombreado mais forte, pra garantir contraste com o texto branco */}
          <div className="absolute inset-0 z-10 bg-black/30 pointer-events-none" />

          <div className="relative z-20 max-w-7xl mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <h2 className="font-vintage text-3xl font-medium text-[#F4EFE6] drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
                Como Trabalhamos
              </h2>
              <p className="text-xs text-[#F4EFE6]/90 uppercase tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]">
                O cuidado por trás de cada detalhe do catálogo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#F4EFE6]/95 backdrop-blur-sm p-8 rounded-lg border border-[#2C221E]/10 shadow-sm space-y-4 hover:border-[#C85A32]/40 transition-all">
                <div className="w-10 h-10 rounded-full bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32]">
                  <Compass className="w-5 h-5 text-[#2C221E]" />
                </div>
                <h3 className="font-vintage text-xl text-[#2C221E]">
                  Garimpo Atento
                </h3>
                <p className="text-xs text-[#5F4E44] leading-relaxed">
                  Percorremos feiras, casarões históricos e acervos particulares
                  por todo o país em busca de achados raros e singulares.
                </p>
              </div>

              <div className="bg-[#F4EFE6]/95 backdrop-blur-sm p-8 rounded-lg border border-[#2C221E]/10 shadow-sm space-y-4 hover:border-[#C85A32]/40 transition-all">
                <div className="w-10 h-10 rounded-full bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32]">
                  <Sparkles className="w-5 h-5 text-[#2C221E]" />
                </div>
                <h3 className="font-vintage text-xl text-[#2C221E]">
                  Preservação Consciente
                </h3>
                <p className="text-xs text-[#5F4E44] leading-relaxed">
                  Higienizamos e realizamos manutenções pontuais sem interferir
                  nas marcas do tempo que conferem autenticidade à peça.
                </p>
              </div>

              <div className="bg-[#F4EFE6]/95 backdrop-blur-sm p-8 rounded-lg border border-[#2C221E]/10 shadow-sm space-y-4 hover:border-[#C85A32]/40 transition-all">
                <div className="w-10 h-10 rounded-full bg-[#C85A32]/10 flex items-center justify-center text-[#C85A32]">
                  <HeartHandshake className="w-5 h-5 text-[#2C221E]" />
                </div>
                <h3 className="font-vintage text-xl text-[#2C221E]">
                  Novos Lares
                </h3>
                <p className="text-xs text-[#5F4E44] leading-relaxed">
                  Embalamos e enviamos cada objeto com cuidado reforçado para
                  que a peça chegue com segurança ao seu novo destino.
                </p>
              </div>
            </div>
          </div>
        </section>

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
                  <Image
                    src={produtoSelecionado.imagem}
                    alt={produtoSelecionado.nome}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#C85A32]">
                    {produtoSelecionado.categoria} — {produtoSelecionado.ano}
                  </span>
                  <h3 className="font-vintage text-2xl font-medium text-[#2C221E]">
                    {produtoSelecionado.nome}
                  </h3>
                  <p className="text-xs text-[#5F4E44] leading-relaxed">
                    {produtoSelecionado.descricao}
                  </p>
                  <p className="text-xs text-[#5F4E44]">
                    <strong>Origem:</strong> {produtoSelecionado.origem}
                  </p>
                  <p className="font-mono text-xl font-semibold text-[#2C221E]">
                    {formatarPreco(produtoSelecionado.preco)}
                  </p>

                  <button
                    onClick={() => {
                      adicionarAoCarrinho(produtoSelecionado.id);
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

        {/* FOOTER PRINCIPAL */}
        <footer className="border-t border-[#2C221E]/10 bg-[#EAE3D2]/40 py-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#5F4E44] mb-8">
            <div className="flex items-center justify-center gap-3 text-center">
              <ShieldCheck className="w-5 h-5 text-[#C85A32] shrink-0" />
              <span>Autenticidade e origem certificadas em catálogo.</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-center">
              <Truck className="w-5 h-5 text-[#C85A32] shrink-0" />
              <span>
                Envio seguro com embalagem especial para peças frágeis.
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 text-center">
              <Check className="w-5 h-5 text-[#C85A32] shrink-0" />
              <span>Atendimento personalizado para colecionadores.</span>
            </div>
          </div>
          <div className="w-full mx-auto py-10 -mb-10 text-center text-xs bg-[#2C221E]/10 text-[#5F4E44] space-y-1 border-t border-[#2C221E]/10 pt-6">
            <p className="font-vintage text-sm text-[#2C221E]">
              Retrôa • Loja de Antiguidades
            </p>
            <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
}