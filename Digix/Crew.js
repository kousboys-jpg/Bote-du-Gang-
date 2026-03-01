import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from 'baileys';

import readline from 'readline';
import pino from 'pino';
import fs from 'fs';
import configmanager from '../utils/configmanager.js';

const SESSION_FOLDER = 'sessionData';

/* ===========================
   DEMANDE NUMÉRO UTILISATEUR
=========================== */
async function getUserNumber() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question(
            '📲 Entrez votre numéro WhatsApp (avec indicatif, ex: 243xxxxxxxxx): ',
            (number) => {
                rl.close();
                resolve(number.replace(/\D/g, ''));
            }
        );
    });
}

/* ===========================
   CONNEXION WHATSAPP
=========================== */
async function connectToWhatsapp(handleMessage) {
    const { version } = await fetchLatestBaileysVersion();

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        markOnlineOnConnect: true,
        syncFullHistory: false,
        logger: pino({ level: 'silent' }),
        keepAliveIntervalMs: 15000,
        connectTimeoutMs: 60000,
        generateHighQualityLinkPreview: true,
    });

    /* ===== SAUVEGARDE SESSION ===== */
    sock.ev.on('creds.update', saveCreds);

    /* ===========================
       ÉTAT DE CONNEXION
    =========================== */
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'connecting') {
            console.log('⏳ Connexion à WhatsApp...');
        }

        if (connection === 'open') {
            console.log('✅ WhatsApp connecté avec succès !');

            // MESSAGE DE BIENVENUE
            await sendWelcomeMessage(sock);

            // ÉCOUTE DES MESSAGES
            sock.ev.on('messages.upsert', async (msg) => {
                try {
                    await handleMessage(sock, msg);
                } catch (err) {
                    console.error('❌ Erreur message handler:', err);
                }
            });
        }

        if (connection === 'close') {
            const statusCode =
                lastDisconnect?.error?.output?.statusCode;

            console.log(
                '❌ Déconnecté | Code:',
                statusCode
            );

            if (statusCode !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconnexion dans 5 secondes...');
                setTimeout(() => connectToWhatsapp(handleMessage), 5000);
            } else {
                console.log('🚫 Déconnexion définitive (logout)');
            }
        }
    });

    /* ===========================
       PAIRING CODE (SI NON CONNECTÉ)
    =========================== */
    setTimeout(async () => {
        if (!state.creds.registered) {
            try {
                const number = await getUserNumber();

                console.log(`🔑 Génération du code pour ${number}`);
                const code = await sock.requestPairingCode(
                    number,
                    'DIGICREW'
                );

                console.log('📲 Code de liaison:', code);
                console.log('👉 Entrez ce code dans WhatsApp');

                // CONFIG UTILISATEUR
                configmanager.config.users[number] = {
                    sudoList: [`${number}@s.whatsapp.net`],
                    prefix: '.',
                    antilink: true,
                    response: true,
                    autoreact: false,
                    reaction: '🎯',
                    welcome: false,
                    record: true,
                    publicMode: false,
                };

                configmanager.save();

            } catch (err) {
                console.error('❌ Erreur pairing:', err);
            }
        }
    }, 5000);

    return sock;
}

/* ===========================
   MESSAGE DE BIENVENUE
=========================== */
async function sendWelcomeMessage(sock) {
    try {
        const chatId = '243833389567@s.whatsapp.net';
        const imagePath = './database/DigixCo.jpg';

        const message = `
╔════════════════════╗
   *DigiX Crew Bot* 🚀
╠════════════════════╣
✅ Connexion réussie
💻 Digital Crew 243
╚════════════════════╝
        `;

        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chatId, {
                image: fs.readFileSync(imagePath),
                caption: message,
            });
        } else {
            await sock.sendMessage(chatId, { text: message });
        }

        console.log('📩 Message de bienvenue envoyé');

    } catch (err) {
        console.error('❌ Erreur message bienvenue:', err);
    }
}

export default connectToWhatsapp;