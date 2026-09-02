"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, User, Mail, Lock, MapPin, Phone, ShieldCheck, CreditCard, Calendar, Home } from "lucide-react";
import { supabase } from "../lib/supabase";

// Formata CPF: 000.000.000-00
const formatarCPF = (value: string) => {
    return value
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

// Formata CEP: 00000-000
const formatarCEP = (value: string) => {
    return value
        .replace(/\D/g, "")
        .slice(0, 8)
        .replace(/(\d{5})(\d)/, "$1-$2");
};

// Calcula a idade a partir da data de nascimento (formato "YYYY-MM-DD")
const calcularIdade = (dataNasc: string) => {
    const hoje = new Date();
    const nascimento = new Date(dataNasc);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const aindaNaoFezAniversario =
        hoje.getMonth() < nascimento.getMonth() ||
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
    if (aindaNaoFezAniversario) idade--;
    return idade;
};

export default function CadastroPage() {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [telefone, setTelefone] = useState("");
    const [endereco, setEndereco] = useState("");
    const [cpf, setCpf] = useState("");
    const [cep, setCep] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [carregando, setCarregando] = useState(false);
    const [erroIdade, setErroIdade] = useState("");

    const processarCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        setErroIdade("");

        // Bloqueia cadastro de menores de 18 anos
        const idade = calcularIdade(dataNascimento);
        if (idade < 18) {
            setErroIdade("Você precisa ter 18 anos ou mais para criar uma conta e comprar na Retrôa.");
            return;
        }

        setCarregando(true);

        // Salvando na tabela Clientes do Supabase
        // A senha é criptografada automaticamente por um trigger no banco (não fica visível)
        const { data, error } = await supabase
            .from("Clientes")
            .insert([
                {
                    nome,
                    email,
                    telefone,
                    endereco,
                    senha,
                    cpf,
                    cep,
                    data_nascimento: dataNascimento,
                }
            ])
            .select();

        if (error) {
            console.error("Erro ao cadastrar:", error.message);
            alert("Erro ao criar conta. Verifique os dados ou se o e-mail já existe.");
            setCarregando(false);
            return;
        }

        // Salva a sessão localmente para manter o usuário logado
        // Obs: por segurança, evite guardar a senha aqui, mesmo que criptografada no banco
        const clienteCriado = data ? data[0] : { nome, email, telefone, endereco, cpf, cep, data_nascimento: dataNascimento };
        const { senha: _senhaOmitida, ...clienteSemSenha } = clienteCriado;
        localStorage.setItem("retroa_sessao", JSON.stringify(clienteSemSenha));

        alert("Conta criada com sucesso no Supabase!");
        window.location.href = "/carrinho";
    };

    return (
        <div className="min-h-screen bg-[#F4EFE6] text-[#2C221E] font-sans antialiased flex flex-col justify-between">

            <nav className="border-b border-[#2C221E]/10 bg-[#F4EFE6]/95">
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
                    <Link href="/" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5F4E44] hover:text-[#2C221E]">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar ao Início</span>
                    </Link>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 py-12 w-full flex-grow flex flex-col justify-center">
                <div className="bg-[#EAE3D2]/40 p-8 rounded-lg border border-[#2C221E]/10 space-y-6">
                    <div className="text-center space-y-1">
                        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#C85A32]">
                            Novo Cliente
                        </span>
                        <h1 className="font-vintage text-2xl font-medium text-[#2C221E]">
                            Criar nova conta
                        </h1>
                    </div>

                    <form onSubmit={processarCadastro} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Nome Completo</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Seu nome"
                                    className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                                />
                                <User className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#5F4E44] block mb-1">E-mail</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                                />
                                <Mail className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-[#5F4E44] block mb-1">CPF</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={cpf}
                                        onChange={(e) => setCpf(formatarCPF(e.target.value))}
                                        placeholder="000.000.000-00"
                                        inputMode="numeric"
                                        maxLength={14}
                                        className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                                    />
                                    <CreditCard className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Data de Nascimento</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        required
                                        value={dataNascimento}
                                        onChange={(e) => {
                                            setDataNascimento(e.target.value);
                                            setErroIdade("");
                                        }}
                                        className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                                    />
                                    <Calendar className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                                </div>
                                {erroIdade && (
                                    <p className="text-[11px] text-[#C85A32] mt-1">{erroIdade}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Telefone</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        required
                                        value={telefone}
                                        onChange={(e) => setTelefone(e.target.value)}
                                        placeholder="(00) 00000-0000"
                                        className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                                    />
                                    <Phone className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#5F4E44] block mb-1">CEP</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={cep}
                                        onChange={(e) => setCep(formatarCEP(e.target.value))}
                                        placeholder="00000-000"
                                        inputMode="numeric"
                                        maxLength={9}
                                        className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                                    />
                                    <Home className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Endereço de Entrega</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={endereco}
                                    onChange={(e) => setEndereco(e.target.value)}
                                    placeholder="Rua, Número, Bairro, Cidade - UF"
                                    className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                                />
                                <MapPin className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#5F4E44] block mb-1">Senha</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#EADFD0] text-xs text-[#2C221E] pl-9 pr-3 py-2.5 rounded border-none focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
                                />
                                <Lock className="w-4 h-4 text-[#5F4E44] absolute left-3 top-3" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={carregando}
                            className="w-full bg-[#C85A32] text-white text-xs font-semibold uppercase tracking-wider py-3 rounded hover:bg-[#B04C27] transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {carregando ? "Cadastrando..." : "Cadastrar"}
                        </button>
                    </form>

                    <div className="text-center pt-2 border-t border-[#2C221E]/10">
                        <Link href="/login" className="text-xs text-[#C85A32] hover:underline">
                            Já tem uma conta? Faça login
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="border-t border-[#2C221E]/10 bg-[#EAE3D2]/40 py-6 text-center text-xs text-[#5F4E44]">
                <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C85A32]" />
                    <span>Dados protegidos e integrados ao banco de dados.</span>
                </div>
            </footer>
        </div>
    );
}