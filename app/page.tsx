"use client";

import { useState } from "react";
import { Search, ShoppingBag, X, Check, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";

const PRODUTOS_MOCK = [
  {
    id: "1",
    nome: "Vaso de cerâmica artesanal marajoara",
    categoria: "Cerâmica",
    origem: "Santarém, PA",
    preco: 480.00,
    ano: "1965",
    tag: "Peça Única",
    descricao: "Vaso em cerâmica artesanal com grafismos geométricos tradicionais feitos à mão. Acabamento natural em tom terracota.",
    imagem: "/vaso.png",
  },
  {
    id: "2",
    nome: "Máquina de escrever Remington vintage",
    categoria: "Escritório",
    origem: "São Paulo, SP",
    preco: 950.00,
    ano: "1948",
    tag: "Revisada",
    descricao: "Máquina de escrever portátil em estrutura metálica preta com pátina do tempo. Mecanismo de teclas preservado.",
    imagem: "/maquinaEscrever.png",
  },
  {
    id: "3",
    nome: "Abajur de mesa em latão e cúpula de vidro",
    categoria: "Iluminação",
    origem: "Petrópolis, RJ",
    preco: 720.00,
    ano: "1955",
    tag: "Funcionando",
    descricao: "Luminária de mesa estilo banqueiro com corpo tubular em latão e cúpula cônica em vidro âmbar transpassado.",
    imagem: "/abajur.png",
  },
  {
    id: "4",
    nome: "Rádio de mesa em caixa de madeira nobre",
    categoria: "Música",
    origem: "Curitiba, PR",
    preco: 1280.00,
    ano: "1958",
    tag: "Relíquia",
    descricao: "Rádio AM/FM vintage em gabinete de madeira trabalhada com botões seletores e mostrador analógico iluminado.",
    imagem: "/radio.png",
  },
  {
    id: "5",
    nome: "Espelho de parede com moldura dourada entalhada",
    categoria: "Decoração",
    origem: "Ouro Preto, MG",
    preco: 1150.00,
    ano: "1930",
    tag: "Raro",
    descricao: "Espelho clássico retangular com moldura entalhada em gesso e acabamento em folha de ouro envelhecida.",
    imagem: "/espelho.png",
  },
  {
    id: "6",
    nome: "Poltrona em madeira nobre e palhinha indiana",
    categoria: "Casa",
    origem: "Pelotas, RS",
    preco: 2100.00,
    ano: "1962",
    tag: "Achado",
    descricao: "Poltrona com estrutura em jacarandá maciço, braços anatômicos e encosto/assento em palhinha trançada natural.",
    imagem: "/cadeira.png",
  },
];

const CATEGORIAS = ["Todas", "Cerâmica", "Escritório", "Iluminação", "Música", "Decoração", "Casa"];

export default function Home() {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas");
  const [carrinho, setCarrinho] = useState<string[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState<typeof PRODUTOS_MOCK[0] | null>(null);

  const produtosFiltrados = PRODUTOS_MOCK.filter((p) => {
    const atendeCategoria = categoriaAtiva === "Todas" || p.categoria === categoriaAtiva;
    const atendeBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.origem.toLowerCase().includes(busca.toLowerCase());
    return atendeCategoria && atendeBusca;
  });

  const adicionarAoCarrinho = (id: string) => {
    setCarrinho((prev) => [...prev, id]);
  };

  const formatarPreco = (valor: number) => {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,400&display=swap');
        .font-vintage { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

      <div className="min-h-screen bg-[#F4EFE6] text-[#2C221E] font-sans antialiased">
        {/* NAVEGAÇÃO */}
        <nav className="sticky top-0 z-40 bg-[#F4EFE6]/95 backdrop-blur-md border-b border-[#2C221E]/10">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center">
              <Image
                src="/logotransp.png"
                alt="Logo Retrôa"
                height={50}
                width={50}
                className="object-contain h-auto w-auto"
                priority
              />
            </a>

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
              <a href="#produtos" className="hover:text-[#2C221E] transition-colors">Produtos</a>
              <a href="/sobre" className="hover:text-[#2C221E] transition-colors">Sobre</a>

              <button className="flex items-center gap-2 border border-[#2C221E]/20 px-4 py-2 rounded-md hover:bg-[#2C221E] hover:text-[#F4EFE6] transition-all relative">
                <ShoppingBag className="w-4 h-4" />
                <span>Sacola</span>
                <span className="bg-[#C85A32] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {carrinho.length}
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <header className="relative w-full min-h-[420px] flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/image.png"
              alt="Acervo Retrôa"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F4EFE6] via-[#F4EFE6]/90 to-transparent w-full md:w-3/4"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#F4EFE6] via-transparent to-[#F4EFE6]/30"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 w-full">
            <div className="max-w-xl space-y-4">
              <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-[#C85A32]">
                Curadoria de Antiguidades
              </span>
              <h1 className="font-vintage text-4xl md:text-5xl font-medium leading-[1.1] text-[#2C221E]">
                Objetos com <span className="italic font-normal">história e memória</span>.
              </h1>
              <p className="text-sm text-[#4A3E37] leading-relaxed max-w-md">
                Peças únicas catalogadas por todo o Brasil, restauradas mantendo a pátina e a originalidade do tempo.
              </p>
            </div>
          </div>
        </header>

        {/* VITRINE DE PRODUTOS */}
        <section id="produtos" className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#2C221E]/10 pb-4 mb-8 gap-4">
            <div>
              <h2 className="font-vintage text-3xl font-medium text-[#2C221E]">Catálogo</h2>
              <p className="text-xs text-[#5F4E44] mt-1">{produtosFiltrados.length} itens disponíveis para compra</p>
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
                onClick={() => { setBusca(""); setCategoriaAtiva("Todas"); }}
                className="mt-2 text-xs text-[#C85A32] underline underline-offset-4"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {produtosFiltrados.map((item) => (
                <div key={item.id} className="group block bg-[#EAE3D2]/30 rounded-lg p-3 border border-[#2C221E]/5 hover:border-[#2C221E]/20 transition-all">
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
        </section>

        {/* MODAL DETALHES */}
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

        {/* FOOTER */}
        <footer className="border-t border-[#2C221E]/10 bg-[#EAE3D2]/40 py-12">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#5F4E44]">
            <div className="flex items-center justify-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#C85A32]" />
              <span>Autenticidade e origem certificadas em catálogo.</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Truck className="w-5 h-5 text-[#C85A32]" />
              <span>Envio seguro com embalagem especial para peças frágeis.</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Check className="w-5 h-5 text-[#C85A32]" />
              <span>Atendimento personalizado para colecionadores.</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}