import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { cep } = body;

        if (!cep) {
            return NextResponse.json({ error: "CEP não informado." }, { status: 400 });
        }

        const cepLimpo = cep.replace(/\D/g, "");

        if (cepLimpo.length !== 8) {
            return NextResponse.json({ error: "CEP inválido. Deve conter 8 dígitos." }, { status: 400 });
        }

        // Consulta oficial na API pública do ViaCEP no backend
        const respostaViaCep = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const dadosCep = await respostaViaCep.json();

        if (dadosCep.erro) {
            return NextResponse.json({ error: "CEP não encontrado na base de dados." }, { status: 404 });
        }

        // Lógica de cálculo de frete baseada na região (Estado)
        const isSp = dadosCep.uf === "SP";
        const freteEconomico = isSp ? 18.00 : 45.00;
        const freteExpresso = isSp ? 35.00 : 80.00;

        const opcoesFrete = [
            {
                id: "econ",
                nome: `Econômico (${dadosCep.localidade} - ${dadosCep.uf})`,
                preco: freteEconomico,
                prazo: isSp ? "4 a 7 dias úteis" : "8 a 14 dias úteis"
            },
            {
                id: "exp",
                nome: `Expresso (${dadosCep.localidade} - ${dadosCep.uf})`,
                preco: freteExpresso,
                prazo: isSp ? "1 a 3 dias úteis" : "3 a 6 dias úteis"
            }
        ];

        return NextResponse.json({
            endereco: {
                cep: dadosCep.cep,
                logradouro: dadosCep.logradouro,
                bairro: dadosCep.bairro,
                cidade: dadosCep.localidade,
                uf: dadosCep.uf
            },
            opcoesFrete
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Erro interno ao processar o cálculo de frete." }, { status: 500 });
    }
}