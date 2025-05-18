const { Client, MessageMedia, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client();
const usuarios = {};
const imagensPromocionais = {};

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR Code gerado, escaneie com o WhatsApp!');
});

client.on('ready', () => {
    console.log('🤖 Cliente WhatsApp pronto!');
});

client.on('message', async (msg) => {
    const id = msg.from;
    const texto = msg.body.toLowerCase();

    if (!usuarios[id]) {
        usuarios[id] = { etapa: 'inicio', imagemEnviada: false };
    }

    const usuario = usuarios[id];

    // Salvar imagens promocionais
    if (msg.hasMedia && id === '558694881169@c.us' && ['(foto1)', '(foto2)', '(foto3)'].some(f => texto.includes(f))) {
        const media = await msg.downloadMedia();
        if (texto.includes('(foto1)')) imagensPromocionais.foto1 = media;
        if (texto.includes('(foto2)')) imagensPromocionais.foto2 = media;
        if (texto.includes('(foto3)')) imagensPromocionais.foto3 = media;
        return client.sendMessage(id, `✅ ${texto.toUpperCase()} salva com sucesso!`);
    }

    switch (usuario.etapa) {
        case 'inicio': {
            const contact = await msg.getContact();
            const nome = contact.pushname?.split(" ")[0] || "amigo(a)";

            await client.sendMessage(id, `👋 Olá, ${nome}! Seja bem-vindo(a) ao nosso espaço exclusivo para *massoterapeutas*! 💆‍♂️💆‍♀️`);

            if (!usuario.imagemEnviada) {
                try {
                    const media = await MessageMedia.fromUrl('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjV58uGf-bdVDZKjEhCvTQtSBctPmOCj8pLcn0ECV4B7382-13q6R863tJRVjLSNCyVAQlaq3yiT_miCQjOJcfP2g1sEtIvpyZbPdkc8yX-aMTTUUQoN-kg5N-XB5e8FQmsrGg4BSSmHThsdVUAHUJ0EC8x50rI2jB7ul2MClq9JjclGKq6Mc2iGt0L6snR/s320/Guia%20para%20Massoterapeutas%20e%20Alunos.png');
                    await client.sendMessage(id, media);
                    usuario.imagemEnviada = true;
                } catch (err) {
                    console.log('❌ Erro ao enviar imagem inicial:', err);
                }
            }

            const menu = `📋 *Menu Principal* — Escolha uma opção respondendo com o número:

1️⃣ 📚 Cursos e Workshops  
2️⃣ 💡 Técnicas e Dicas Profissionais  
3️⃣ 💰 Promoções Exclusivas  
4️⃣ 🤝 Networking com Profissionais  
5️⃣ 🗓️ Agendar Sessão de Massagem  
6️⃣ 📜 Lei do Massoterapeuta (PDF)  
7️⃣ 🧑‍💻 Falar com um atendente  
8️⃣ 👤 Massoterapeuta Indicado  
9️⃣ 💳 Fazer Pagamento via Pix`;

            await client.sendMessage(id, menu);
            usuario.etapa = 'aguardando_opcao';
            break;
        }

        case 'aguardando_opcao': {
            switch (texto) {
                case '1':
                    await client.sendMessage(id, '📚 *Cursos e Workshops:*\n\n- Curso de Drenagem Linfática\n- Workshop de Massagem Relaxante\n- Curso Avançado de Shiatsu\n\nMais em: https://linkdoscursos.com');
                    usuario.etapa = 'finalizado';
                    break;
                case '2':
                    await client.sendMessage(id, '💡 *Técnicas e Dicas Profissionais:*\n\n- Como usar óleos essenciais\n- Sequência de massagem eficaz\n- Dicas para postura\n\nMais em: https://linkdicasmassoterapia.com');
                    usuario.etapa = 'finalizado';
                    break;
                case '3':
                    await client.sendMessage(id, '💰 *Promoções Exclusivas!*');
                    if (imagensPromocionais.foto1) await client.sendMessage(id, imagensPromocionais.foto1);
                    if (imagensPromocionais.foto2) await client.sendMessage(id, imagensPromocionais.foto2);
                    if (imagensPromocionais.foto3) await client.sendMessage(id, imagensPromocionais.foto3);
                    usuario.etapa = 'finalizado';
                    break;
                case '4':
                    await client.sendMessage(id, '🤝 *Networking com Profissionais:*\n👉 https://chat.whatsapp.com/linkdogrupo');
                    usuario.etapa = 'finalizado';
                    break;
                case '5':
                    await client.sendMessage(id, '🗓️ *Escolha um horário:*\n1. 10h às 11h\n2. 11h às 12h\n3. 13h às 14h\n4. 14h às 15h\n5. 15h às 16h\n6. 16h às 17h');
                    usuario.etapa = 'aguardando_horario';
                    break;
                case '6':
                    await client.sendMessage(id, '📜 *Lei do Massoterapeuta*\nAcesse o PDF:\nhttps://drive.google.com/file/d/1zAlJQkSKlBQocy1mRSy2i85YJycOj1i_/view?usp=sharing');
                    usuario.etapa = 'finalizado';
                    break;
                case '7':
                    await client.sendMessage(id, '🧑‍💻 Encaminhando para um atendente...');
                    usuario.etapa = 'aguardando_atendimento';
                    break;
                case '8':
                    try {
                        const media = await MessageMedia.fromUrl('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiqC33-cczguopHF1y-AveJujAlug4JHDV0bQSBor2yJfQ30cKYDCNmYeALrj4UjVl5ueSGEnlU0jroYAI2J1SP0hvjxWQN70eV1PjXkYjlbxXK0tZJ5-OtdKuxI4Q2s5EZxsdAFNiK1R6PsAXTNFUg58MV_P1iQyam4HyuyLk2-WUKGcFSqexLR8ubkWSj/s320/aas.jpg');
                        await client.sendMessage(id, media);
                        await client.sendMessage(id, '📞 Entre em contato com: +55 86 99545-1400');
                    } catch (err) {
                        await client.sendMessage(id, '❌ Erro ao enviar indicado.');
                    }
                    usuario.etapa = 'finalizado';
                    break;
                case '9':
                    const button = new Buttons(
                        '💳 *Pagamento via Pix*\n\nClique no botão abaixo para gerar seu link de pagamento.',
                        [{ body: 'Pagar via Pix 💸' }],
                        'Pagamento',
                        'Escolha'
                    );
                    await client.sendMessage(id, button);
                    usuario.etapa = 'aguardando_botao_pix';
                    break;
                default:
                    await client.sendMessage(id, '❌ Opção inválida. Digite um número de 1 a 9.');
                    break;
            }
            break;
        }

        case 'aguardando_horario': {
            const horarios = {
                '1': '10h às 11h', '2': '11h às 12h', '3': '13h às 14h',
                '4': '14h às 15h', '5': '15h às 16h', '6': '16h às 17h'
            };
            if (horarios[texto]) {
                await client.sendMessage(id, `✅ Agendamento confirmado para *${horarios[texto]}*`);
                usuario.etapa = 'finalizado';
            } else {
                await client.sendMessage(id, '❌ Horário inválido. Digite um número de 1 a 6.');
            }
            break;
        }

        case 'aguardando_botao_pix': {
            if (texto.includes('pagar')) {
                await client.sendMessage(id, '✅ Aqui está seu link de pagamento:\n👉 *https://bit.ly/4mfpmrX*');
                await client.sendMessage(id, '📸 *Ou escaneie o QR Code abaixo:*');
                const qr = await MessageMedia.fromUrl('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgCxomQBvayRGefcGeYzYTOViS7fo7duqtbMdbR5Z0T1DACYNNUSZWlivS7BvINM1i0vgFcixdIX3WoTU9HcxlkAQLQSVexI5G48uLguwck-9j5H1XAS6g0k6vmrKnf_UMFsqvxSxrxgkgjzv3ZYWOq2YeLJ3u_5AASAEMIykULcURXt3pvV19v-rB-L6VO/w400-h290/WhatsApp%20Image%202025-05-17%20at%2001.13.33.jpeg');
                await client.sendMessage(id, qr);
                usuario.etapa = 'finalizado';
            } else {
                await client.sendMessage(id, '💳 Por favor, clique no botão *Pagar via Pix 💸* para continuar.');
            }
            break;
        }

        case 'aguardando_atendimento':
            await client.sendMessage(id, '🔔 Um atendente falará com você em breve...');
            break;

        case 'finalizado':
        case 'fim':
            await client.sendMessage(id, '✅ Digite *menu* para ver as opções novamente.');
            usuario.etapa = 'inicio';
            break;
    }
});

client.initialize();
