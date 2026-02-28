    
    let report = 'ðŸ“Š *Liste des Warns*\n\n'
    
    for (const key of warnKeys) {
        const userId = key.split('_')[1]
        const warnCount = warnStorage[key]
        report += `@${userId.split('@')[0]} : ${warnCount}/3 warns\n`
    }
    
    await client.sendMessage(groupId, { text: report })
}

export async function kick(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return
    
    try {
        const text = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
        const args = text.split(/\s+/).slice(1)
        let target
        
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            target = message.message.extendedTextMessage.contextInfo.participant
        } else if (args[0]) {
            target = args[0].replace('@', '') + '@s.whatsapp.net'
        } else {
            return await client.sendMessage(groupId, { text: 'âŒ RÃ©ponds Ã  un message ou mentionne.' })
        }
        
        await client.groupParticipantsUpdate(groupId, [target], 'remove')
        await client.sendMessage(groupId, { text: `ðŸš« @${target.split('@')[0]} exclu.` })
    } catch (error) {
        await client.sendMessage(groupId, { text: 'âŒ Erreur' })
    }
}

export async function kickall(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return
    
    try {
        const metadata = await client.groupMetadata(groupId)
        const targets = metadata.participants.filter(p => !p.admin).map(p => p.id)
        
        await client.sendMessage(groupId, { text: 'âš¡ Digital Crew - Purge...' })
        
        for (const target of targets) {
            try {
                await client.groupParticipantsUpdate(groupId, [target], 'remove')
            } catch {}
        }
        
        await client.sendMessage(groupId, { text: 'âœ… Purge terminÃ©e.' })
    } catch (error) {
        await client.sendMessage(groupId, { text: 'âŒ Erreur' })
    }
}

export async function kickall2(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return
    
    try {
        const metadata = await client.groupMetadata(groupId)
        const targets = metadata.participants.filter(p => !p.admin).map(p => p.id)
        
        await client.sendMessage(groupId, { text: 'âš¡ Digital Crew - One Shot...' })
        await client.groupParticipantsUpdate(groupId, targets, 'remove')
        await client.sendMessage(groupId, { text: 'âœ… Tous exclus.' })
    } catch (error) {
        await client.sendMessage(groupId, { text: 'âŒ Erreur' })
    }
}

export async function promote(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return
    
    try {
        const text = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
        const args = text.split(/\s+/).slice(1)
        let target
        
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            target = message.message.extendedTextMessage.contextInfo.participant
        } else if (args[0]) {
            target = args[0].replace('@', '') + '@s.whatsapp.net'
        } else {
            return await client.sendMessage(groupId, { text: 'âŒ RÃ©ponds Ã  un message ou mentionne.' })
        }
        
        await client.groupParticipantsUpdate(groupId, [target], 'promote')
        await client.sendMessage(groupId, { text: `ðŸ‘‘ @${target.split('@')[0]} promu admin.` })
    } catch (error) {
        await client.sendMessage(groupId, { text: 'âŒ Erreur' })
    }
}

export async function demote(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return
    
    try {
        const text = message.message?.extendedTextMessage?.text || message.message?.conversation || ''
        const args = text.split(/\s+/).slice(1)
        let target
        
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            target = message.message.extendedTextMessage.contextInfo.participant
        } else if (args[0]) {
            target = args[0].replace('@', '') + '@s.whatsapp.net'
        } else {
            return await client.sendMessage(groupId, { text: 'âŒ RÃ©ponds Ã  un message ou mentionne.' })
        }
        
        await client.groupParticipantsUpdate(groupId, [target], 'demote')
        await client.sendMessage(groupId, { text: `ðŸ“‰ @${target.split('@')[0]} retirÃ© admin.` })
    } catch (error) {
        await client.sendMessage(groupId, { text: 'âŒ Erreur' })
    }
}

export async function gclink(client, message) {
    const groupId = message.key.remoteJid
    if (!groupId.includes('@g.us')) return
    
    try {
        const code = await client.groupInviteCode(groupId)
        await client.sendMessage(groupId, { 
            text: `ðŸ”— Lien du groupe:\nhttps://chat.whatsapp.com/${code}` 
        })
    } catch (error) {
        await client.sendMessage(groupId, { text: 'âŒ Impossible de gÃ©nÃ©rer le lien.' })
    }
}

export async function join(client, message) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || ''
        const match = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i)
        if (match) {
            await client.groupAcceptInvite(match[1])
        }
    } catch {}
}

export default { 
    kick, 
    kickall, 
    kickall2,
    promote, 
    demote, 
    gclink, 
    join,
    antilink, 
    linkDetection,
    resetwarns,
    checkwarns
}